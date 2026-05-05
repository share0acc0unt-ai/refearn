'use client';

import { useState, useEffect } from "react";
import { formatUSD } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { CheckIcon, CopyIcon, ArrowRightIcon } from "lucide-react";

export default function PurchaseCreditsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState('');
    const [copied, setCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [usdtWalletAddress, setUsdtWalletAddress] = useState('');
    const [network, setNetwork] = useState('TRC20');

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchPaymentConfig = async () => {
            try {
                const response = await fetch('/api/payment-config');
                if (response.ok) {
                    const data = await response.json();
                    const configs = data.configs || [];
                    const usdtConfig = configs.find((c: any) => c.key === 'usdt_wallet_address');
                    const networkConfig = configs.find((c: any) => c.key === 'usdt_network');

                    if (usdtConfig) setUsdtWalletAddress(usdtConfig.value);
                    if (networkConfig) setNetwork(networkConfig.value);
                }
            } catch (err) {
                console.error('Error fetching payment config:', err);
            }
        };
        fetchPaymentConfig();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (!response.ok) {
                router.push('/login');
                return;
            }
            const data = await response.json();
            if (data.user.role !== 'guider') {
                router.push('/dashboard');
                return;
            }
            setUser(data.user);
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(usdtWalletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!txHash) {
            setError('Please enter the transaction hash');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/guider/purchase-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    transactionHash: txHash,
                    network: network,
                    usdtAddress: usdtWalletAddress
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setSubmitted(true);
            setAmount('');
            setTxHash('');

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/dashboard/transactions');
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">Buy Credits</h1>
                    <p className="text-white/60 text-sm sm:text-base mt-2">
                        Purchase credits using USDT to generate codes for your users
                    </p>
                </div>

                {/* Current Balance */}
                <div className="mb-8 rounded-xl border border-[#32673f] bg-[#193320] p-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">account_balance_wallet</span>
                        <div>
                            <p className="text-white/70 text-sm">Current Balance</p>
                            <p className="text-white text-3xl font-bold">{formatUSD(user?.credits || 0)}</p>
                        </div>
                    </div>
                </div>

                {submitted ? (
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                            <CheckIcon className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-white text-2xl font-bold mb-2">Request Submitted!</h2>
                        <p className="text-white/70 mb-6">
                            Your payment is being verified. Your credits will be added to your account once approved.
                        </p>
                        <p className="text-white/50 text-sm">Redirecting to transactions...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Payment Instructions */}
                        <div className="flex flex-col gap-6">
                            <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                                <h3 className="text-white text-xl font-bold mb-4">Payment Details</h3>

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">USDT Wallet Address ({network})</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={usdtWalletAddress}
                                                readOnly
                                                className="flex-1 rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white/80 text-sm focus:outline-none"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                type="button"
                                                className="flex items-center gap-2 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                            >
                                                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
                                            <div className="flex-1">
                                                <p className="text-white/90 text-sm font-medium mb-1">Instructions:</p>
                                                <ul className="text-[#92c9a0] text-xs space-y-1 list-disc list-inside">
                                                    <li>Send the exact amount of USDT equivalent to the credits you want</li>
                                                    <li>Use {network} network only</li>
                                                    <li>Copy the transaction hash after sending</li>
                                                    <li>Fill the form and submit for verification</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submission Form */}
                        <div className="flex flex-col gap-6">
                            <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6">
                                <h3 className="text-white text-xl font-bold mb-4">Submit Payment</h3>

                                {error && (
                                    <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Amount ($)</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Enter amount sent"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Transaction Hash</label>
                                        <input
                                            type="text"
                                            value={txHash}
                                            onChange={(e) => setTxHash(e.target.value)}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Paste transaction hash"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                        {!submitting && <ArrowRightIcon className="h-4 w-4" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
