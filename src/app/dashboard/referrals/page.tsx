'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";
import { Copy, Check } from "lucide-react";

export default function ReferralsPage() {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [referralCode, setReferralCode] = useState('');
    const [totalReferrals, setTotalReferrals] = useState(0);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetchReferrals();
    }, [page]);

    const fetchReferrals = async () => {
        try {
            const response = await fetch(`/api/user/referrals?page=${page}&limit=${perPage}`);
            if (response.ok) {
                const data = await response.json();
                setReferrals(data.referrals);
                setReferralCode(data.referralCode);
                setTotalReferrals(data.totalReferrals);
                setTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching referrals:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = () => {
        const link = `${window.location.origin}/signup?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="p-8 lg:p-12">
                <div className="mx-auto max-w-7xl flex items-center justify-center h-64">
                    <p className="text-white text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                {/* Page Heading */}
                <div className="flex flex-wrap justify-between gap-3 mb-8">
                    <div className="flex min-w-72 flex-col gap-2">
                        <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Referrals</p>
                        <p className="text-[#92c9a0] text-base font-normal leading-normal">
                            Earn 50% commission on every successful referral
                        </p>
                    </div>
                </div>

                {/* Referral Code Card */}
                <div className="mb-10 rounded-xl border border-white/10 bg-white/5 p-6">
                    <h2 className="text-white text-xl font-bold mb-4">Your Referral Code</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-white/70 text-sm mb-2 block">Referral Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={referralCode}
                                    readOnly
                                    className="flex-1 rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    onClick={copyReferralCode}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-[#112215] font-bold hover:bg-primary/90 transition-colors"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-white/70 text-sm mb-2 block">Referral Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`}
                                    readOnly
                                    className="flex-1 rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    onClick={copyReferralLink}
                                    className="flex items-center gap-2 rounded-lg bg-[#23482c] px-6 py-3 text-white font-bold hover:bg-[#23482c]/80 transition-colors"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="text-white/70 text-sm mb-1">Total Referrals</p>
                        <p className="text-white text-3xl font-bold">{totalReferrals}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="text-white/70 text-sm mb-1">This Month</p>
                        <p className="text-white text-3xl font-bold">
                            {referrals.filter(r => {
                                const date = new Date(r.createdAt);
                                const now = new Date();
                                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="text-white/70 text-sm mb-1">Commission Rate</p>
                        <p className="text-primary text-3xl font-bold">50%</p>
                    </div>
                </div>

                {/* Referrals Table */}
                <div>
                    <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
                        Your Referral Network
                    </h2>
                    {referrals.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                            <span className="material-symbols-outlined text-white/30 text-6xl mb-4 block">groups</span>
                            <p className="text-white/70 text-lg mb-2">No referrals yet</p>
                            <p className="text-white/50 text-sm">Share your referral code to start earning commissions!</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-white/10">
                                        <tr>
                                            <th className="text-left p-4 text-white/70 font-medium">Name</th>
                                            <th className="text-left p-4 text-white/70 font-medium">Username</th>
                                            <th className="text-left p-4 text-white/70 font-medium">Plan</th>
                                            <th className="text-left p-4 text-white/70 font-medium">Joined</th>
                                            <th className="text-left p-4 text-white/70 font-medium">Total Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referrals.map((referral) => (
                                            <tr key={referral._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-white">{referral.name}</td>
                                                <td className="p-4 text-white/80">@{referral.username}</td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                                                        {referral.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-white/70">
                                                    {new Date(referral.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-primary font-medium">
                                                    {formatUSD(referral.referralBalance + referral.taskBalance)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center px-4 pb-4">
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
        </div>
    );
}
