'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (!response.ok) {
                    router.push('/login');
                    return;
                }
                const data = await response.json();
                const role = data.user.role?.toUpperCase();
                if (!['ADMIN', 'SUPERADMIN'].includes(role)) {
                    router.push('/dashboard');
                    return;
                }
            } catch (err) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-dark">
                <div className="text-white text-xl">Loading Admin Panel...</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {children}
        </div>
    );
}
