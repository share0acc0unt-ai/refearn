'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";

interface User {
    _id: string;
    name: string;
    username: string;
    whatsapp: string;
    email?: string;
    role: string;
    isSuspended: boolean;
    credits: number;
    referralBalance: number;
    taskBalance: number;
    commissionBalance: number;
    referralCode: string;
    createdAt: string;
}

interface UserDetails {
    user: User;
    transactions: any[];
    referrals: any[];
    campaigns: any[];
    withdrawals: any[];
    creditCodes: any[];
    guiderInfo?: any;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const perPage = 10;

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
    }, [roleFilter, page]);

    const fetchCurrentUser = async () => {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
        }
    };

    const fetchUsers = async () => {
        try {
            let url = `/api/admin/users?role=${roleFilter}&page=${page}&limit=${perPage}`;
            if (search) url += `&search=${search}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setTotalPages(data.totalPages || 1);
                setTotalUsers(data.total || 0);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleSuspend = async (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'unsuspend' : 'suspend';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    action: action
                }),
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update user');
            }
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    const handleViewUser = async (userId: string) => {
        setLoadingDetails(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedUser(data);
            } else {
                alert('Failed to fetch user details');
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading users...</div>;

    return (
        <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-white text-3xl font-bold">User Management</h1>
                        <p className="text-white/60 mt-1">Manage users, roles, and permissions ({totalUsers} total)</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
                        />
                        <button type="submit" className="bg-primary text-[#112215] px-4 py-2 rounded-lg font-bold">
                            Search
                        </button>
                    </form>
                </div>

                <div className="mb-6">
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Roles</option>
                        <option value="lite">Lite</option>
                        <option value="pro">Pro</option>
                        <option value="premium">Premium</option>
                        <option value="guider">Guider</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">SuperAdmin</option>
                    </select>
                </div>

                <div className="rounded-xl border border-[#32673f] bg-[#193320] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#102215] border-b border-[#32673f]">
                                <tr>
                                    <th className="text-left p-4 text-white/70 font-medium">User</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Role</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Status</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Credits</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Joined</th>
                                    <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{user.name || 'No Name'}</p>
                                                <p className="text-white/50 text-sm">@{user.username}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold capitalize
                                                ${user.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' :
                                                    user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                                                        user.role === 'guider' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            user.role === 'premium' ? 'bg-amber-500/20 text-amber-400' :
                                                                user.role === 'pro' ? 'bg-cyan-500/20 text-cyan-400' :
                                                                    'bg-green-500/20 text-green-400'
                                                }
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                                ${user.isSuspended ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
                                            `}>
                                                {user.isSuspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white font-mono">
                                            {formatUSD(user.credits || 0)}
                                        </td>
                                        <td className="p-4 text-white/60 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user._id)}
                                                    className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                                                >
                                                    View
                                                </button>
                                                {user._id !== currentUser?._id && (
                                                    <button
                                                        onClick={() => handleSuspend(user._id, user.isSuspended)}
                                                        className={`${user.isSuspended ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'} text-sm font-bold`}
                                                    >
                                                        {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                    </button>
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
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-[#193320] border border-[#32673f] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-white text-2xl font-bold">User Details</h2>
                            <button onClick={() => setSelectedUser(null)} className="text-white/60 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="text-white text-center py-8">Loading details...</div>
                        ) : (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-white/60 text-sm">Name</p>
                                            <p className="text-white">{selectedUser.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Username</p>
                                            <p className="text-white">@{selectedUser.user.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">WhatsApp</p>
                                            <p className="text-white">{selectedUser.user.whatsapp}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Role</p>
                                            <p className="text-white capitalize">{selectedUser.user.role}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Credits</p>
                                            <p className="text-primary font-bold">{formatUSD(selectedUser.user.credits || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Referral Balance</p>
                                            <p className="text-white">{formatUSD(selectedUser.user.referralBalance || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Task Balance</p>
                                            <p className="text-white">{formatUSD(selectedUser.user.taskBalance || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Commission Balance</p>
                                            <p className="text-white">{formatUSD(selectedUser.user.commissionBalance || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Referral Code</p>
                                            <p className="text-white font-mono">{selectedUser.user.referralCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-sm">Status</p>
                                            <p className={selectedUser.user.isSuspended ? 'text-red-400' : 'text-green-400'}>
                                                {selectedUser.user.isSuspended ? 'Suspended' : 'Active'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transactions */}
                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Recent Transactions ({selectedUser.transactions.length})</h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedUser.transactions.map((tx: any) => (
                                            <div key={tx._id} className="flex justify-between items-center bg-[#193320] p-3 rounded">
                                                <div>
                                                    <p className="text-white text-sm">{tx.description}</p>
                                                    <p className="text-white/50 text-xs">{new Date(tx.createdAt).toLocaleString()}</p>
                                                </div>
                                                <p className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.amount >= 0 ? '+' : ''}{formatUSD(tx.amount || 0)}
                                                </p>
                                            </div>
                                        ))}
                                        {selectedUser.transactions.length === 0 && (
                                            <p className="text-white/50 text-center py-4">No transactions yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Withdrawals */}
                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Withdrawals ({selectedUser.withdrawals.length})</h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedUser.withdrawals.map((wd: any) => (
                                            <div key={wd._id} className="bg-[#193320] p-3 rounded">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-white font-bold">{formatUSD(wd.amount || 0)}</p>
                                                    <span className={`text-xs px-2 py-1 rounded ${wd.status === 'completed' ? 'bg-green-500/20 text-green-400' : wd.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {wd.status}
                                                    </span>
                                                </div>
                                                {wd.accountDetails && (
                                                    <div className="text-sm space-y-1 mt-2 border-t border-white/10 pt-2">
                                                        <p className="text-white/60">Bank: <span className="text-white">{wd.accountDetails.bankName}</span></p>
                                                        <p className="text-white/60">Account: <span className="text-white">{wd.accountDetails.accountNumber}</span></p>
                                                        <p className="text-white/60">Name: <span className="text-white">{wd.accountDetails.accountName}</span></p>
                                                    </div>
                                                )}
                                                <p className="text-white/50 text-xs mt-2">{new Date(wd.createdAt).toLocaleString()}</p>
                                            </div>
                                        ))}
                                        {selectedUser.withdrawals.length === 0 && (
                                            <p className="text-white/50 text-center py-4">No withdrawals yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Referrals */}
                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Referrals ({selectedUser.referrals.length})</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedUser.referrals.map((ref: any) => (
                                            <div key={ref._id} className="flex justify-between items-center bg-[#193320] p-3 rounded">
                                                <div>
                                                    <p className="text-white text-sm">{ref.name}</p>
                                                    <p className="text-white/50 text-xs">@{ref.username}</p>
                                                </div>
                                                <p className="text-white/60 text-xs">{new Date(ref.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                        {selectedUser.referrals.length === 0 && (
                                            <p className="text-white/50 text-center py-4">No referrals yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Campaigns */}
                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Campaigns ({selectedUser.campaigns.length})</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedUser.campaigns.map((camp: any) => (
                                            <div key={camp._id} className="bg-[#193320] p-3 rounded">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-white text-sm font-bold">{camp.actionType}</p>
                                                        <p className="text-white/50 text-xs">{camp.platform} - {camp.targetCount} targets</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded ${camp.status === 'active' ? 'bg-green-500/20 text-green-400' : camp.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {camp.status}
                                                    </span>
                                                </div>
                                                <p className="text-primary font-bold mt-2">{formatUSD(camp.totalCost || 0)}</p>
                                            </div>
                                        ))}
                                        {selectedUser.campaigns.length === 0 && (
                                            <p className="text-white/50 text-center py-4">No campaigns yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Credit Codes (if guider) */}
                                {selectedUser.creditCodes && selectedUser.creditCodes.length > 0 && (
                                    <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                        <h3 className="text-white font-bold mb-4">Credit Codes Generated ({selectedUser.creditCodes.length})</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {selectedUser.creditCodes.map((code: any) => (
                                                <div key={code._id} className="flex justify-between items-center bg-[#193320] p-3 rounded">
                                                    <div>
                                                        <p className="text-white font-mono">{code.code}</p>
                                                        <p className="text-white/50 text-xs">{code.purpose}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-primary font-bold">{formatUSD(code.amount || 0)}</p>
                                                        <span className={`text-xs ${code.status === 'USED' ? 'text-green-400' : code.status === 'EXPIRED' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                            {code.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
