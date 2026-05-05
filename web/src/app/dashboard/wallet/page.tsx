'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatUSD } from "@/lib/currency";
import CurrencyCalculator from "@/components/CurrencyCalculator";

interface Balances {
    referralBalance: number;
    taskBalance: number;
    credits: number;
    commissionBalance: number; // For guiders
    totalBalance: number;
    totalMade: number;
    totalWithdrawn: number;
}

export default function WalletPage() {
    const [balances, setBalances] = useState<Balances | null>(null);
    const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
    const [userRole, setUserRole] = useState<string>(''); // Track user role
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState<'bank_transfer'>('bank_transfer');
    const [balanceType, setBalanceType] = useState<'referral' | 'task'>('referral');
    const [accountDetails, setAccountDetails] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        walletAddress: '',
        network: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const response = await fetch('/api/user/wallet');
            if (response.ok) {
                const data = await response.json();
                setBalances(data.balances);
                setPendingWithdrawal(data.pendingWithdrawal || 0);
            }

            // Fetch user info to get role
            const userResponse = await fetch('/api/auth/me');
            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUserRole(userData.user?.role || '');
            }
        } catch (err) {
            console.error('Error fetching wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const availableBalance = balanceType === 'referral'
            ? (balances?.referralBalance || 0)
            : (balances?.taskBalance || 0);

        if (amount > availableBalance) {
            setError(`Insufficient ${balanceType} balance`);
            return;
        }

        if (amount < 5000) {
            setError('Minimum withdrawal amount is ₦5,000');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/user/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    method: withdrawMethod,
                    balanceType,
                    accountDetails: {
                        accountName: accountDetails.accountName,
                        accountNumber: accountDetails.accountNumber,
                        bankName: accountDetails.bankName,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit withdrawal');
            }

            setSuccess('Withdrawal request submitted successfully! Awaiting admin approval.');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setAccountDetails({
                accountName: '',
                accountNumber: '',
                bankName: '',
                walletAddress: '',
                network: '',
            });
            fetchWallet();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-white text-xl">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">My Wallet</h1>
                        <p className="text-white/60 text-sm sm:text-base mt-2">
                            Manage your earnings and withdrawals
                        </p>
                    </div>
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">payments</span>
                        <span className="text-sm sm:text-base">Withdraw</span>
                    </button>
                </div>

                {success && (
                    <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
                            <p className="text-white/70 text-sm">Current Balance</p>
                        </div>
                        <p className="text-white text-3xl font-bold">{formatUSD(balances?.totalBalance || 0)}</p>
                        <p className="text-white/50 text-xs mt-1">Referral + Task Balance</p>
                    </div>

                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-green-400 text-3xl">monetization_on</span>
                            <p className="text-white/70 text-sm">Total Made</p>
                        </div>
                        <p className="text-white text-3xl font-bold">{formatUSD(balances?.totalMade || 0)}</p>
                        <p className="text-white/50 text-xs mt-1">Lifetime Earnings</p>
                    </div>

                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-red-400 text-3xl">payments</span>
                            <p className="text-white/70 text-sm">Total Withdrawn</p>
                        </div>
                        <p className="text-white text-3xl font-bold">{formatUSD(balances?.totalWithdrawn || 0)}</p>
                        <p className="text-white/50 text-xs mt-1">Approved Withdrawals</p>
                    </div>

                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-blue-400 text-3xl">group</span>
                            <p className="text-white/70 text-sm">Referral Balance</p>
                        </div>
                        <p className="text-white text-3xl font-bold">{formatUSD(balances?.referralBalance || 0)}</p>
                    </div>

                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-purple-400 text-3xl">task_alt</span>
                            <p className="text-white/70 text-sm">Task Balance</p>
                        </div>
                        <p className="text-white text-3xl font-bold">{formatUSD(balances?.taskBalance || 0)}</p>
                    </div>

                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-yellow-400 text-3xl">credit_card</span>
                            <p className="text-white/70 text-sm">Credits</p>
                        </div>
                        <p className="text-white text-3xl font-bold">{formatUSD(balances?.credits || 0)}</p>
                    </div>

                    {/* Commission Balance - Guiders Only */}
                    {userRole === 'guider' && (
                        <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-orange-400 text-3xl">paid</span>
                                <p className="text-white/70 text-sm">Commission Balance</p>
                            </div>
                            <p className="text-white text-3xl font-bold">{formatUSD(balances?.commissionBalance || 0)}</p>
                            <p className="text-white/50 text-xs mt-1">Guider Earnings</p>
                        </div>
                    )}
                </div>

                {/* Pending Withdrawal */}
                {pendingWithdrawal > 0 && (
                    <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-yellow-400 text-3xl">pending</span>
                            <div>
                                <p className="text-white font-bold">Pending Withdrawal</p>
                                <p className="text-white/70 text-sm">{formatUSD(pendingWithdrawal)} awaiting approval</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Link href="/dashboard/transactions">
                        <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6 hover:border-primary transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary text-4xl">receipt_long</span>
                                <div>
                                    <h3 className="text-white text-lg font-bold">Transaction History</h3>
                                    <p className="text-white/70 text-sm">View all your transactions</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/referrals">
                        <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6 hover:border-primary transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary text-4xl">groups</span>
                                <div>
                                    <h3 className="text-white text-lg font-bold">My Referrals</h3>
                                    <p className="text-white/70 text-sm">Manage your referral network</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Withdrawal Modal */}
                {showWithdrawModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-[#193320] border border-[#32673f] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-white text-2xl font-bold">Request Withdrawal</h2>
                                <button
                                    onClick={() => {
                                        setShowWithdrawModal(false);
                                        setError('');
                                    }}
                                    className="text-white/70 hover:text-white"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Withdraw From</label>
                                    <select
                                        value={balanceType}
                                        onChange={(e) => setBalanceType(e.target.value as 'referral' | 'task')}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="referral">Referral Balance (₦{balances?.referralBalance.toLocaleString() || 0})</option>
                                        <option value="task">Task Balance (₦{balances?.taskBalance.toLocaleString() || 0})</option>
                                    </select>
                                </div>

                                <div>
                                    <CurrencyCalculator onAmountChange={setWithdrawAmount} />
                                    <p className="text-white/50 text-xs mt-1">
                                        Available: ₦{(balanceType === 'referral' ? balances?.referralBalance : balances?.taskBalance)?.toLocaleString() || 0}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Withdrawal Method</label>
                                    <select
                                        value={withdrawMethod}
                                        onChange={(e) => setWithdrawMethod(e.target.value as 'bank_transfer')}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Account Name</label>
                                    <input
                                        type="text"
                                        value={accountDetails.accountName}
                                        onChange={(e) => setAccountDetails({ ...accountDetails, accountName: e.target.value })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Account Number</label>
                                    <input
                                        type="text"
                                        value={accountDetails.accountNumber}
                                        onChange={(e) => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="0123456789"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-white text-sm font-medium mb-2 block">Bank Name</label>
                                    <input
                                        type="text"
                                        value={accountDetails.bankName}
                                        onChange={(e) => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="First Bank"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || parseFloat(withdrawAmount) > ((balanceType === 'referral' ? balances?.referralBalance : balances?.taskBalance) || 0)}
                                    className="w-full rounded-lg bg-primary px-4 py-3 text-[#112215] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
