'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

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
            <div className="mx-auto max-w-4xl">
                {/* Page Heading */}
                <div className="flex flex-wrap justify-between gap-3 mb-8">
                    <div className="flex min-w-72 flex-col gap-2">
                        <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Account Settings</p>
                        <p className="text-[#92c9a0] text-base font-normal leading-normal">
                            Manage your account preferences
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Profile Information */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="text-white text-xl font-bold mb-4">Profile Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/70 text-sm">Full Name</label>
                                <p className="text-white font-medium">{user?.name}</p>
                            </div>
                            <div>
                                <label className="text-white/70 text-sm">Username</label>
                                <p className="text-white font-medium">@{user?.username}</p>
                            </div>
                            <div>
                                <label className="text-white/70 text-sm">WhatsApp Number</label>
                                <p className="text-white font-medium">{user?.whatsapp}</p>
                            </div>
                            <div>
                                <label className="text-white/70 text-sm">Role</label>
                                <p className="text-white font-medium capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="text-white text-xl font-bold mb-4">Account Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/70 text-sm">Referral Code</label>
                                <p className="text-primary font-mono font-bold text-lg">{user?.referralCode}</p>
                            </div>
                            <div>
                                <label className="text-white/70 text-sm">Account Status</label>
                                <p className={`font-medium ${user?.suspended ? 'text-red-500' : 'text-green-500'}`}>
                                    {user?.suspended ? 'Suspended' : 'Active'}
                                </p>
                            </div>
                            <div>
                                <label className="text-white/70 text-sm">Member Since</label>
                                <p className="text-white font-medium">
                                    {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Balances */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="text-white text-xl font-bold mb-4">Balances</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-lg bg-white/5 p-4">
                                <label className="text-white/70 text-sm">Credits</label>
                                <p className="text-primary text-2xl font-bold">{user?.credits?.toLocaleString() || 0}</p>
                            </div>
                            <div className="rounded-lg bg-white/5 p-4">
                                <label className="text-white/70 text-sm">Referral Balance</label>
                                <p className="text-primary text-2xl font-bold">{formatUSD(user?.referralBalance || 0)}</p>
                            </div>
                            <div className="rounded-lg bg-white/5 p-4">
                                <label className="text-white/70 text-sm">Task Balance</label>
                                <p className="text-primary text-2xl font-bold">{formatUSD(user?.taskBalance || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h2 className="text-white text-xl font-bold mb-4">Quick Actions</h2>
                        <div className="flex flex-col gap-3">
                            <button className="text-left px-4 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors">
                                <span className="font-medium">Change Password</span>
                                <p className="text-white/60 text-sm">Update your account password</p>
                            </button>
                            <button className="text-left px-4 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors">
                                <span className="font-medium">Update WhatsApp Number</span>
                                <p className="text-white/60 text-sm">Change your contact information</p>
                            </button>
                            <button className="text-left px-4 py-3 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors">
                                <span className="font-medium">Request Account Deletion</span>
                                <p className="text-red-500/80 text-sm">Permanently delete your account</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
