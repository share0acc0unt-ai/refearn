'use client';

import { useEffect, useState } from "react";

export default function AdminStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-white">Loading stats...</div>;

    return (
        <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-white text-3xl font-bold mb-8">Platform Statistics</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-xl border border-[#32673f] bg-[#193320]">
                        <p className="text-white/60 text-sm mb-1">Total Users</p>
                        <p className="text-white text-3xl font-bold">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="p-6 rounded-xl border border-[#32673f] bg-[#193320]">
                        <p className="text-white/60 text-sm mb-1">Active Users</p>
                        <p className="text-white text-3xl font-bold">{stats?.activeUsers || 0}</p>
                    </div>
                    <div className="p-6 rounded-xl border border-[#32673f] bg-[#193320]">
                        <p className="text-white/60 text-sm mb-1">Total Tasks</p>
                        <p className="text-white text-3xl font-bold">{stats?.totalTasks || 0}</p>
                    </div>
                    <div className="p-6 rounded-xl border border-[#32673f] bg-[#193320]">
                        <p className="text-white/60 text-sm mb-1">Total Transactions</p>
                        <p className="text-white text-3xl font-bold">{stats?.totalTransactions || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
