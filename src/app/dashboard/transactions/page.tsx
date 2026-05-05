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
    createdAt: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetchTransactions();
    }, [filter, statusFilter, page]);

    const fetchTransactions = async () => {
        try {
            let url = `/api/user/transactions?page=${page}&limit=${perPage}`;
            if (filter !== 'all') url += `&type=${filter}`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions);
                setTotalPages(data.pagination?.pages || 1);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        const colors: any = {
            referral_commission: 'text-green-400',
            task_reward: 'text-blue-400',
            withdrawal: 'text-red-400',
            credit_purchase: 'text-purple-400',
            ad_payment: 'text-yellow-400',
            signup_commission: 'text-green-400',
            ad_commission: 'text-green-400',
        };
        return colors[type] || 'text-white';
    };

    const getTypeIcon = (type: string) => {
        const icons: any = {
            referral_commission: 'group',
            task_reward: 'task_alt',
            withdrawal: 'payments',
            credit_purchase: 'credit_card',
            ad_payment: 'campaign',
            signup_commission: 'person_add',
            ad_commission: 'ads_click',
        };
        return icons[type] || 'receipt';
    };

    const getStatusBadge = (status: string) => {
        const colors: any = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            completed: 'bg-green-500/20 text-green-400 border-green-500/30',
            failed: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status] || 'bg-white/10 text-white/60 border-white/20';
    };

    const formatType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">Transaction History</h1>
                    <p className="text-white/60 text-sm sm:text-base mt-2">
                        View all your financial transactions
                    </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-white text-sm font-medium mb-2 block">Filter by Type</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Types</option>
                            <option value="referral_commission">Referral Commission</option>
                            <option value="task_reward">Task Reward</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="credit_purchase">Credit Purchase</option>
                            <option value="ad_payment">AD Payment</option>
                            <option value="signup_commission">Signup Commission</option>
                            <option value="ad_commission">AD Commission</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-white text-sm font-medium mb-2 block">Filter by Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Transactions List */}
                {transactions.length === 0 ? (
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-12 text-center">
                        <span className="material-symbols-outlined text-white/30 text-6xl mb-4 block">receipt_long</span>
                        <p className="text-white/70 text-lg mb-2">No transactions found</p>
                        <p className="text-white/50 text-sm">Your transaction history will appear here</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr>
                                        <th className="text-left p-4 text-white/70 font-medium">Type</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Description</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Amount</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Status</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined ${getTypeColor(transaction.type)}`}>
                                                        {getTypeIcon(transaction.type)}
                                                    </span>
                                                    <span className="text-white text-sm">{formatType(transaction.type)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-white/80 text-sm">{transaction.description}</td>
                                            <td className="p-4">
                                                <span className={`font-bold ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {transaction.amount >= 0 ? '+' : ''}{formatUSD(Math.abs(transaction.amount))}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white/70 text-sm">
                                                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6 px-6 pb-6">
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
                    </div>
                )}
            </div>
        </div>
    );
}
