'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";

interface Campaign {
    _id: string;
    userId: {
        name: string;
        email: string;
        whatsapp: string;
    };
    contactInfo: string;
    platform: string;
    actionType: string;
    link: string;
    image?: string;
    targetCount: number;
    costPerAction: number;
    totalCost: number;
    creditCode: string;
    status: string;
    createdAt: string;
}

export default function AdminCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCampaigns, setTotalCampaigns] = useState(0);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const perPage = 10;

    useEffect(() => {
        fetchCampaigns();
    }, [statusFilter, page]);

    const fetchCampaigns = async () => {
        try {
            let url = `/api/admin/campaigns?page=${page}&limit=${perPage}`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
                setTotalPages(data.totalPages || 1);
                setTotalCampaigns(data.total || 0);
            }
        } catch (err) {
            console.error('Error fetching campaigns:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (campaignId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this campaign?`)) return;

        try {
            const response = await fetch('/api/admin/campaigns', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, action }),
            });

            if (response.ok) {
                setSelectedCampaign(null);
                fetchCampaigns();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update campaign');
            }
        } catch (err) {
            console.error('Error updating campaign:', err);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading campaigns...</div>;

    return (
        <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-white text-3xl font-bold">Ad Campaigns</h1>
                        <p className="text-white/60 mt-1">Manage and approve campaigns ({totalCampaigns} total)</p>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="rounded-xl border border-[#32673f] bg-[#193320] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#102215] border-b border-[#32673f]">
                                <tr>
                                    <th className="text-left p-4 text-white/70 font-medium">User</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Platform</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Action</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Target</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Cost</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Status</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Date</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => (
                                    <tr key={campaign._id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{campaign.userId?.name || 'Unknown'}</p>
                                                <p className="text-white/50 text-sm">{campaign.userId?.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white capitalize">{campaign.platform}</td>
                                        <td className="p-4 text-white capitalize">{campaign.actionType.replace('_', ' ')}</td>
                                        <td className="p-4 text-white">{campaign.targetCount}</td>
                                        <td className="p-4 text-white font-bold">{formatUSD(campaign.totalCost)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                                ${campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                    campaign.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-red-500/20 text-red-400'}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white/60 text-sm">
                                            {new Date(campaign.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedCampaign(campaign)}
                                                    className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                                                >
                                                    View
                                                </button>
                                                {campaign.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(campaign._id, 'approve')}
                                                            className="text-green-400 hover:text-green-300 text-sm font-bold"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(campaign._id, 'reject')}
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

                {/* Campaign Details Modal */}
                {selectedCampaign && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCampaign(null)}>
                        <div className="bg-[#193320] border border-[#32673f] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-white text-2xl font-bold">Campaign Details</h2>
                                <button onClick={() => setSelectedCampaign(null)} className="text-white/60 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-sm">User</p>
                                        <p className="text-white">{selectedCampaign.userId?.name}</p>
                                        <p className="text-white/50 text-sm">{selectedCampaign.userId?.email}</p>
                                        <p className="text-white/50 text-sm">{selectedCampaign.userId?.whatsapp}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Status</p>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                            ${selectedCampaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                selectedCampaign.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    selectedCampaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-red-500/20 text-red-400'}`}>
                                            {selectedCampaign.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Platform</p>
                                        <p className="text-white capitalize">{selectedCampaign.platform}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Action Type</p>
                                        <p className="text-white capitalize">{selectedCampaign.actionType.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Target Count</p>
                                        <p className="text-white">{selectedCampaign.targetCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Cost Per Action</p>
                                        <p className="text-white">{formatUSD(selectedCampaign.costPerAction)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Total Cost</p>
                                        <p className="text-primary font-bold text-lg">{formatUSD(selectedCampaign.totalCost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Credit Code</p>
                                        <p className="text-white font-mono">{selectedCampaign.creditCode}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-white/60 text-sm mb-1">Campaign Link</p>
                                    <a href={selectedCampaign.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                                        {selectedCampaign.link}
                                    </a>
                                </div>

                                {selectedCampaign.image && (
                                    <div>
                                        <p className="text-white/60 text-sm mb-2">Campaign Image</p>
                                        <img src={selectedCampaign.image} alt="Campaign" className="w-full max-w-md rounded-lg" />
                                    </div>
                                )}

                                {selectedCampaign.status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => handleAction(selectedCampaign._id, 'approve')}
                                            className="flex-1 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold hover:bg-green-500/30 transition-colors"
                                        >
                                            Approve Campaign
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedCampaign._id, 'reject')}
                                            className="flex-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/30 transition-colors"
                                        >
                                            Reject Campaign
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
