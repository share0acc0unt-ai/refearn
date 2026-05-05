'use client';

import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="w-full min-h-screen bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Hero Section */}
                <div className="flex flex-col gap-4 text-center items-center mb-8 sm:mb-10 lg:mb-12">
                    <div className="text-primary">
                        <span className="material-symbols-outlined text-5xl sm:text-6xl">dashboard</span>
                    </div>
                    <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight max-w-3xl">
                        Welcome to Your Dashboard
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base leading-normal max-w-2xl px-4">
                        Manage your campaigns, view analytics, and track your advertising performance.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
                    {/* Create Campaign */}
                    <Link href="/dashboard/advertise" className="group">
                        <div className="flex flex-col gap-4 rounded-xl border border-[#32673f] bg-[#193320] p-6 hover:border-primary transition-all cursor-pointer h-full">
                            <div className="text-primary">
                                <span className="material-symbols-outlined text-4xl">ads_click</span>
                            </div>
                            <h3 className="text-white text-lg sm:text-xl font-bold">Create Campaign</h3>
                            <p className="text-white/70 text-sm">
                                Start a new advertising campaign and reach your target audience
                            </p>
                        </div>
                    </Link>

                    {/* My Campaigns */}
                    <Link href="/dashboard/campaigns" className="group">
                        <div className="flex flex-col gap-4 rounded-xl border border-[#32673f] bg-[#193320] p-6 hover:border-primary transition-all cursor-pointer h-full">
                            <div className="text-primary">
                                <span className="material-symbols-outlined text-4xl">campaign</span>
                            </div>
                            <h3 className="text-white text-lg sm:text-xl font-bold">My Campaigns</h3>
                            <p className="text-white/70 text-sm">
                                View and manage all your active and past campaigns
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Recent Activity Section */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <h2 className="text-white text-xl sm:text-2xl font-bold">Recent Activity</h2>
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6 sm:p-8 lg:p-12">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <span className="material-symbols-outlined text-white/30 text-5xl sm:text-6xl">inbox</span>
                            <p className="text-white/60 text-center text-sm sm:text-base max-w-md">
                                No recent activity. Create your first campaign to get started!
                            </p>
                            <Link href="/dashboard/advertise">
                                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors mt-2">
                                    <span className="material-symbols-outlined">add</span>
                                    <span className="text-sm sm:text-base">Create Campaign</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
