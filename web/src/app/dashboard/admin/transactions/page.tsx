'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";

interface Transaction {
    _id: string;
    type: string;
    amount: number;
    balanceType: string;
    description: string;
    status: string;
    hash?: string;
    createdAt: string;
    userId: {
        name: string;
        email: string;
    };
    metadata?: {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        usdtAddress?: string;
        transactionHash?: string;
        network?: string;
        [key: string]: any;
    };
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [balanceTypeFilter, setBalanceTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const perPage = 10;
    const [withdrawalDetails, setWithdrawalDetails] = useState<any>(null);

    useEffect(() => {
        if (selectedTransaction?.type === 'withdrawal' && selectedTransaction.metadata?.withdrawalId) {
            fetchWithdrawalDetails(selectedTransaction.metadata.withdrawalId);
        } else {
            setWithdrawalDetails(null);
        }
    }, [selectedTransaction]);

    useEffect(() => {
        fetchTransactions();
    }, [filter, balanceTypeFilter, page]);

    const fetchTransactions = async () => {
        try {
            let url = '/api/admin/transactions?';
            const params = [];
            if (filter !== 'all') params.push(`type=${filter}`);
            if (balanceTypeFilter !== 'all') params.push(`balanceType=${balanceTypeFilter}`);
            params.push(`page=${page}`);
            params.push(`limit=${perPage}`);
            url += params.join('&');

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions);
                setTotalPages(data.totalPages || 1);
                setTotalTransactions(data.total || 0);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (transactionId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;

        try {
            const response = await fetch('/api/admin/transactions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId, action }),
            });

            if (response.ok) {
                setSelectedTransaction(null);
                fetchTransactions();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update transaction');
            }
        } catch (err) {
            console.error('Error updating transaction:', err);
        }
    };

    const fetchWithdrawalDetails = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/withdrawals?id=${id}`);
            if (response.ok) {
                const data = await response.json();
                setWithdrawalDetails(data.withdrawal);
            }
        } catch (err) {
            console.error('Error fetching withdrawal details:', err);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading transactions...</div>;

    return (
        <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-white text-3xl font-bold">Transactions</h1>
                        <p className="text-white/60 mt-1">Monitor and manage transactions ({totalTransactions} total)</p>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={filter}
                            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                            className="bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                        >
                            <option value="all">All Types</option>
                            <option value="withdrawal">Withdrawals</option>
                            <option value="task_reward">Task Rewards</option>
                            <option value="credit_purchase">Credit Purchases</option>
                        </select>
                        <select
                            value={balanceTypeFilter}
                            onChange={(e) => { setBalanceTypeFilter(e.target.value); setPage(1); }}
                            className="bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                        >
                            <option value="all">All Balance Types</option>
                            <option value="referral">Referral Balance</option>
                            <option value="task">Task Balance</option>
                            <option value="credits">Credits</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-xl border border-[#32673f] bg-[#193320] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#102215] border-b border-[#32673f]">
                                <tr>
                                    <th className="text-left p-4 text-white/70 font-medium">User</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Type</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Balance Type</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Amount</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Status</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Date</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx._id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{tx.userId?.name || 'Unknown'}</p>
                                                <p className="text-white/50 text-sm">{tx.userId?.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white capitalize">{tx.type.replace('_', ' ')}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                                ${tx.balanceType === 'referral' ? 'bg-blue-500/20 text-blue-400' :
                                                    tx.balanceType === 'task' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-orange-500/20 text-orange-400'}
                                            `}>
                                                {tx.balanceType}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {formatUSD(Math.abs(tx.amount))}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                                ${tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'}
                                            `}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white/60 text-sm">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedTransaction(tx)}
                                                    className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                                                >
                                                    View
                                                </button>
                                                {tx.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(tx._id, 'approve')}
                                                            className="text-green-400 hover:text-green-300 text-sm font-bold"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(tx._id, 'reject')}
                                                            className="text-red-400 hover:text-red-300 text-sm font-bold"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <p className="text-white/60 text-sm">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg bg-[#193320] border border-[#32673f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#23482c] transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-lg bg-[#193320] border border-[#32673f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#23482c] transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Transaction Details Modal */}
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTransaction(null)}>
                        <div className="bg-[#193320] border border-[#32673f] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-white text-2xl font-bold">Transaction Details</h2>
                                <button onClick={() => setSelectedTransaction(null)} className="text-white/60 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-sm">Transaction ID</p>
                                        <p className="text-white font-mono text-sm">{selectedTransaction._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Status</p>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                            ${selectedTransaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                selectedTransaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'}
                                        `}>
                                            {selectedTransaction.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">User</p>
                                        <p className="text-white">{selectedTransaction.userId?.name || 'Unknown'}</p>
                                        <p className="text-white/50 text-sm">{selectedTransaction.userId?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Amount</p>
                                        <p className={`font-bold text-lg ${selectedTransaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {formatUSD(Math.abs(selectedTransaction.amount))}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Type</p>
                                        <p className="text-white capitalize">{selectedTransaction.type.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Balance Type</p>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                            ${selectedTransaction.balanceType === 'referral' ? 'bg-blue-500/20 text-blue-400' :
                                                selectedTransaction.balanceType === 'task' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-orange-500/20 text-orange-400'}
                                        `}>
                                            {selectedTransaction.balanceType}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Date</p>
                                        <p className="text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-white/60 text-sm mb-1">Description</p>
                                    <p className="text-white bg-[#102215] p-3 rounded-lg">{selectedTransaction.description}</p>
                                </div>

                                {/* Withdrawal Details */}
                                {selectedTransaction.type === 'withdrawal' && withdrawalDetails && (
                                    <div className="bg-[#102215] p-4 rounded-lg border border-[#32673f]">
                                        <h3 className="text-white font-bold mb-3">Withdrawal Details</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Method:</span>
                                                <span className="text-white capitalize">{withdrawalDetails.method?.replace('_', ' ')}</span>
                                            </div>
                                            {withdrawalDetails.accountDetails?.bankName && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Bank Name:</span>
                                                    <span className="text-white">{withdrawalDetails.accountDetails.bankName}</span>
                                                </div>
                                            )}
                                            {withdrawalDetails.accountDetails?.accountNumber && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Account Number:</span>
                                                    <span className="text-white font-mono">{withdrawalDetails.accountDetails.accountNumber}</span>
                                                </div>
                                            )}
                                            {withdrawalDetails.accountDetails?.accountName && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Account Name:</span>
                                                    <span className="text-white">{withdrawalDetails.accountDetails.accountName}</span>
                                                </div>
                                            )}
                                            {withdrawalDetails.accountDetails?.walletAddress && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Wallet Address:</span>
                                                    <span className="text-white font-mono break-all pl-4">{withdrawalDetails.accountDetails.walletAddress}</span>
                                                </div>
                                            )}
                                            {withdrawalDetails.accountDetails?.network && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Network:</span>
                                                    <span className="text-white uppercase">{withdrawalDetails.accountDetails.network}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Credit Purchase Details */}
                                {selectedTransaction.type === 'credit_purchase' && selectedTransaction.metadata && (
                                    <div className="bg-[#102215] p-4 rounded-lg border border-[#32673f]">
                                        <h3 className="text-white font-bold mb-3">USDT Payment Details</h3>
                                        <div className="space-y-3">
                                            {selectedTransaction.metadata.usdtAddress && (
                                                <div>
                                                    <p className="text-white/60 text-sm mb-1">USDT Address</p>
                                                    <p className="text-white font-mono text-sm bg-[#193320] p-2 rounded break-all">
                                                        {selectedTransaction.metadata.usdtAddress}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedTransaction.metadata.network && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Network:</span>
                                                    <span className="text-white uppercase">{selectedTransaction.metadata.network}</span>
                                                </div>
                                            )}
                                            {(selectedTransaction.metadata.transactionHash || selectedTransaction.hash) && (
                                                <div>
                                                    <p className="text-white/60 text-sm mb-1">Transaction Hash</p>
                                                    <p className="text-white font-mono text-sm bg-[#193320] p-2 rounded break-all mb-2">
                                                        {selectedTransaction.metadata.transactionHash || selectedTransaction.hash}
                                                    </p>
                                                    <a
                                                        href={`https://tronscan.org/#/transaction/${selectedTransaction.metadata.transactionHash || selectedTransaction.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-500/30 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                        Verify on TronScan
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedTransaction.status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => handleAction(selectedTransaction._id, 'approve')}
                                            className="flex-1 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold hover:bg-green-500/30 transition-colors"
                                        >
                                            Approve Transaction
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedTransaction._id, 'reject')}
                                            className="flex-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/30 transition-colors"
                                        >
                                            Reject Transaction
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
