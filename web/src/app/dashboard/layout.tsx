'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (!response.ok) {
                    router.push('/login');
                    return;
                }
                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-dark">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full bg-background-dark">
            <Sidebar user={user} />
            <main className="flex-1 w-full overflow-x-hidden">
                {/* Add padding on mobile to account for floating menu button */}
                <div className="lg:p-0 pt-20 lg:pt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
