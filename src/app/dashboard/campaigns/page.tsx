'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";

interface Campaign {
    _id: string;
    adNumber: string;
    title: string;
    description: string;
    targetUrl?: string;
    action: string;
    targetedReach: number;
    duration: number;
    whatsappNumber: string;
    billAmount: number;
    status: 'PENDING_PAYMENT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
    userId?: string;
    createdAt: string;
    updatedAt: string;
}

export default function MyCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/campaigns');

            if (!response.ok) {
                throw new Error('Failed to fetch campaigns');
            }

            const data = await response.json();
            setCampaigns(data.campaigns || []);
        } catch (err: any) {
            console.error('Error fetching campaigns:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'PENDING_PAYMENT':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'PAUSED':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'COMPLETED':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'CANCELLED':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-white/10 text-white/60 border-white/20';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-white/60">Loading campaigns...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
                            <p className="text-red-400 text-center">
                                Error loading campaigns: {error}
                            </p>
                            <button
                                onClick={fetchCampaigns}
                                className="px-6 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
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
                        <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">My Campaigns</h1>
                        <p className="text-white/60 text-sm sm:text-base mt-2">
                            Manage and track all your advertising campaigns
                        </p>
                    </div>
                    <Link href="/dashboard/advertise">
                        <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors">
                            <span className="material-symbols-outlined text-xl">add</span>
                            <span className="text-sm sm:text-base">New Campaign</span>
                        </button>
                    </Link>
                </div>

                {/* Campaigns List */}
                {campaigns.length === 0 ? (
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-8 sm:p-12">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <span className="material-symbols-outlined text-white/30 text-5xl sm:text-6xl">campaign</span>
                            <p className="text-white/60 text-center text-sm sm:text-base max-w-md">
                                You haven't created any campaigns yet. Start your first campaign to reach your audience!
                            </p>
                            <Link href="/dashboard/advertise">
                                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors mt-2">
                                    <span className="material-symbols-outlined">add</span>
                                    <span>Create Campaign</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign._id}
                                className="rounded-xl border border-[#32673f] bg-[#193320] p-4 sm:p-6 hover:border-primary/50 transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Campaign Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                            <h3 className="text-white text-lg sm:text-xl font-bold">
                                                {campaign.title}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(
                                                    campaign.status
                                                )}`}
                                            >
                                                {getStatusLabel(campaign.status)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                            <div>
                                                <p className="text-white/50 text-xs">AD Number</p>
                                                <p className="text-primary font-mono text-sm font-bold">
                                                    {campaign.adNumber}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-white/50 text-xs">Reach</p>
                                                <p className="text-white text-sm font-medium">
                                                    {campaign.targetedReach.toLocaleString()} people
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-white/50 text-xs">Duration</p>
                                                <p className="text-white text-sm font-medium">
                                                    {campaign.duration} days
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-white/50 text-xs">Budget</p>
                                                <p className="text-white text-sm font-medium">
                                                    {formatUSD(campaign.billAmount)}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-white/40 text-xs">
                                            Created on {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row lg:flex-col gap-2">
                                        <Link
                                            href={`/dashboard/campaigns/${campaign._id}`}
                                            className="flex-1 lg:flex-none"
                                        >
                                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#23482c] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a38] transition-colors">
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                                <span>View</span>
                                            </button>
                                        </Link>
                                        {campaign.status === 'ACTIVE' && (
                                            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#23482c] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a38] transition-colors">
                                                <span className="material-symbols-outlined text-lg">pause</span>
                                                <span>Pause</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
