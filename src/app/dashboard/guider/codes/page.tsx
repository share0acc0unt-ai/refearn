'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CreditCode {
    _id: string;
    code: string;
    amount: number;
    purpose: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    usedBy?: {
        name: string;
        username: string;
    };
    usedAt?: string;
}

interface Stats {
    total: number;
    active: number;
    used: number;
    expired: number;
    totalValue: number;
    usedValue: number;
}

export default function CodesPage() {
    const router = useRouter();
    const [codes, setCodes] = useState<CreditCode[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [purposeFilter, setPurposeFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetchCodes();
    }, [statusFilter, purposeFilter, page]);

    const fetchCodes = async () => {
        try {
            let url = '/api/guider/codes';
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', perPage.toString());
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (purposeFilter !== 'all') params.append('purpose', purposeFilter);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 403) {
                    router.push('/dashboard');
                    return;
                }
                throw new Error('Failed to fetch codes');
            }
            const data = await response.json();
            setCodes(data.codes);
            setStats(data.stats);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error('Error fetching codes:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: any = {
            ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
            USED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            EXPIRED: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status] || 'bg-white/10 text-white/60 border-white/20';
    };

    const getPurposeIcon = (purpose: string) => {
        return purpose === 'signup' ? 'person_add' : 'campaign';
    };

    const getPurposeColor = (purpose: string) => {
        return purpose === 'signup' ? 'text-green-400' : 'text-blue-400';
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
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
                        <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">My Credit Codes</h1>
                        <p className="text-white/60 text-sm sm:text-base mt-2">
                            Manage all your generated credit codes
                        </p>
                    </div>
                    <Link href="/dashboard/guider/generate-codes">
                        <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors">
                            <span className="material-symbols-outlined text-xl">add</span>
                            <span className="text-sm sm:text-base">Generate Code</span>
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="rounded-xl border border-[#32673f] bg-[#193320] p-4">
                            <p className="text-white/70 text-xs mb-1">Total Codes</p>
                            <p className="text-white text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                            <p className="text-green-400/70 text-xs mb-1">Active</p>
                            <p className="text-green-400 text-2xl font-bold">{stats.active}</p>
                        </div>
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                            <p className="text-blue-400/70 text-xs mb-1">Used</p>
                            <p className="text-blue-400 text-2xl font-bold">{stats.used}</p>
                        </div>
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                            <p className="text-red-400/70 text-xs mb-1">Expired</p>
                            <p className="text-red-400 text-2xl font-bold">{stats.expired}</p>
                        </div>
                        <div className="rounded-xl border border-[#32673f] bg-[#193320] p-4">
                            <p className="text-white/70 text-xs mb-1">Total Value</p>
                            <p className="text-white text-2xl font-bold">{formatUSD(stats.totalValue)}</p>
                        </div>
                        <div className="rounded-xl border border-[#32673f] bg-[#193320] p-4">
                            <p className="text-white/70 text-xs mb-1">Used Value</p>
                            <p className="text-primary text-2xl font-bold">{formatUSD(stats.usedValue)}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-white text-sm font-medium mb-2 block">Filter by Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="USED">Used</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-white text-sm font-medium mb-2 block">Filter by Purpose</label>
                        <select
                            value={purposeFilter}
                            onChange={(e) => setPurposeFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Purposes</option>
                            <option value="signup">Signup</option>
                            <option value="advertisement">Advertisement</option>
                        </select>
                    </div>
                </div>

                {/* Codes List */}
                {codes.length === 0 ? (
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-12 text-center">
                        <span className="material-symbols-outlined text-white/30 text-6xl mb-4 block">qr_code</span>
                        <p className="text-white/70 text-lg mb-2">No credit codes found</p>
                        <p className="text-white/50 text-sm mb-4">Generate your first credit code to get started</p>
                        <Link href="/dashboard/guider/generate-codes">
                            <button className="px-6 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors">
                                Generate Code
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr>
                                        <th className="text-left p-4 text-white/70 font-medium">Code</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Purpose</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Amount</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Status</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Used By</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Expires</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {codes.map((code) => (
                                        <tr key={code._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-primary font-mono font-bold">{code.code}</code>
                                                    <button
                                                        onClick={() => copyCode(code.code)}
                                                        className="text-white/50 hover:text-white transition-colors"
                                                        title="Copy code"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined ${getPurposeColor(code.purpose)}`}>
                                                        {getPurposeIcon(code.purpose)}
                                                    </span>
                                                    <span className="text-white text-sm capitalize">{code.purpose}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-white font-bold">{formatUSD(code.amount)}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(code.status)}`}>
                                                    {code.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {code.usedBy ? (
                                                    <div>
                                                        <p className="text-white text-sm">{code.usedBy.name}</p>
                                                        <p className="text-white/50 text-xs">@{code.usedBy.username}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-white/40 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-white/70 text-sm">
                                                {new Date(code.expiresAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-white/70 text-sm">
                                                {new Date(code.createdAt).toLocaleDateString()}
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
