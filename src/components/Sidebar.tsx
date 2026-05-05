'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
    user?: {
        name: string;
        username: string;
        role: string;
        profilePhoto?: string;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    // Define all navigation items with role restrictions
    const allNavItems = [
        { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', roles: ['lite', 'pro', 'premium', 'admin', 'guider', 'superadmin'] },
        { name: 'Wallet', href: '/dashboard/wallet', icon: 'account_balance_wallet', roles: ['lite', 'pro', 'premium', 'admin', 'guider'] },
        { name: 'Transactions', href: '/dashboard/transactions', icon: 'receipt_long', roles: ['lite', 'pro', 'premium', 'admin', 'guider'] },
        { name: 'Create Campaign', href: '/dashboard/advertise', icon: 'ads_click', roles: ['lite', 'pro', 'premium', 'admin'] },
        { name: 'My Campaigns', href: '/dashboard/campaigns', icon: 'campaign', roles: ['lite', 'pro', 'premium', 'admin'] },
        { name: 'Referrals', href: '/dashboard/referrals', icon: 'groups', roles: ['lite', 'pro', 'premium', 'admin', 'guider'] },
        { name: 'Tasks', href: '/dashboard/tasks', icon: 'assignment', roles: ['lite', 'pro', 'premium', 'admin', 'guider'] },
        // Guider-specific items
        { name: 'Generate Codes', href: '/dashboard/guider/generate-codes', icon: 'qr_code_2', roles: ['guider'] },
        { name: 'My Codes', href: '/dashboard/guider/codes', icon: 'qr_code', roles: ['guider'] },
        { name: 'Buy Credits', href: '/dashboard/guider/purchase-credits', icon: 'add_card', roles: ['guider'] },
        // Admin & SuperAdmin items
        { name: 'User Management', href: '/dashboard/admin/users', icon: 'manage_accounts', roles: ['admin', 'superadmin'] },
        { name: 'Task Management', href: '/dashboard/admin/tasks', icon: 'assignment_add', roles: ['admin', 'superadmin'] },
        { name: 'Manage Campaigns', href: '/dashboard/admin/campaigns', icon: 'campaign', roles: ['admin', 'superadmin'] },
        { name: 'Transactions', href: '/dashboard/admin/transactions', icon: 'receipt_long', roles: ['admin', 'superadmin'] },
        { name: 'Platform Stats', href: '/dashboard/admin/stats', icon: 'analytics', roles: ['admin', 'superadmin'] },
        { name: 'Settings', href: '/dashboard/settings', icon: 'settings', roles: ['lite', 'pro', 'premium', 'admin', 'guider', 'superadmin'] },
    ];

    // Filter navigation items based on user role
    // Default to 'lite' role if not specified to show standard user menu items
    const userRole = (user?.role?.toLowerCase() || 'lite').trim();
    console.log('User role:', userRole, 'User object:', user);
    let navItems = allNavItems.filter(item => item.roles.includes(userRole));

    // Fallback: if no items after filtering, show all lite items (shouldn't happen but safety net)
    if (navItems.length === 0) {
        console.warn('No nav items after filtering, showing default lite items');
        navItems = allNavItems.filter(item => item.roles.includes('lite'));
    }

    console.log('Filtered nav items:', navItems.length, navItems.map(i => i.name));

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Menu Button - Fixed at top */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 rounded-lg bg-[#193320] border border-[#32673f] text-white hover:bg-[#23482c] transition-colors shadow-lg"
            >
                <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 h-screen z-50
                    flex flex-col bg-[#193320] border-r border-[#32673f]
                    transition-all duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                    w-64
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#32673f]">
                    {!isCollapsed && (
                        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                            <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
                            <h1 className="text-white text-xl font-bold">Paypulse</h1>
                        </Link>
                    )}

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#23482c] text-white/60 hover:text-white transition-colors"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#23482c] text-white/60 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                                        transition-all duration-200
                                        ${active
                                            ? 'bg-primary text-[#112215] font-bold'
                                            : 'text-white/80 hover:bg-[#23482c] hover:text-white'
                                        }
                                        ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                                    `}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <span
                                        className="material-symbols-outlined text-2xl flex-shrink-0"
                                        style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                                    >
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <p className="text-sm font-medium leading-normal truncate">
                                            {item.name}
                                        </p>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile & Logout */}
                <div className="flex flex-col gap-2 border-t border-[#32673f] p-4">
                    {/* User Info */}
                    <div className={`flex items-center gap-3 p-2 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                        <div className="flex h-10 w-10 items-center justify-center bg-primary/20 rounded-full flex-shrink-0">
                            {user?.profilePhoto ? (
                                <img
                                    src={user.profilePhoto}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="text-primary" size={20} />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 flex-1">
                                <h1 className="text-white text-sm font-medium leading-tight truncate">
                                    {user?.name || 'User'}
                                </h1>
                                <p className="text-white/50 text-xs font-normal leading-tight truncate">
                                    @{user?.username || 'username'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg
                            text-white/70 hover:bg-[#23482c] hover:text-white
                            transition-colors
                            ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                        `}
                        title={isCollapsed ? 'Logout' : ''}
                    >
                        <span className="material-symbols-outlined text-2xl flex-shrink-0">logout</span>
                        {!isCollapsed && (
                            <p className="text-sm font-medium leading-normal">Logout</p>
                        )}
                    </button>

                    {/* Exit to Home */}
                    <Link
                        href="/"
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg
                            text-white/70 hover:bg-[#23482c] hover:text-white
                            transition-colors
                            ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                        `}
                        title={isCollapsed ? 'Exit Dashboard' : ''}
                    >
                        <span className="material-symbols-outlined text-2xl flex-shrink-0">home</span>
                        {!isCollapsed && (
                            <p className="text-sm font-medium leading-normal">Exit Dashboard</p>
                        )}
                    </Link>
                </div>
            </aside>
        </>
    );
}
