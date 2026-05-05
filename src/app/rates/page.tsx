'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RatesPage() {
    const [rate, setRate] = useState(1000);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRate();
    }, []);

    const fetchRate = async () => {
        try {
            const response = await fetch('/api/exchange-rate');
            if (response.ok) {
                const data = await response.json();
                setRate(data.rate || 1000);
            }
        } catch (err) {
            console.error('Error fetching rate:', err);
        } finally {
            setLoading(false);
        }
    };

    const examples = [
        { naira: 1000, usd: 1 },
        { naira: 5000, usd: 5 },
        { naira: 10000, usd: 10 },
        { naira: 50000, usd: 50 },
        { naira: 100000, usd: 100 },
        { naira: 500000, usd: 500 },
        { naira: 1000000, usd: 1000 },
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark overflow-x-hidden font-display">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        {/* Header */}
                        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#23482c] px-4 md:px-10 py-3 mb-8">
                            <div className="flex items-center gap-4 text-white">
                                <div className="size-6 text-primary">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_6_543)">
                                            <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                                            <path clipRule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fillRule="evenodd"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_6_543"><rect fill="white" height="48" width="48"></rect></clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Paypulse</h2>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/">
                                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#23482c] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                        <span className="truncate">Back to Home</span>
                                    </button>
                                </Link>
                            </div>
                        </header>

                        {/* Main Content */}
                        <main className="flex flex-col gap-8 px-4 py-10">
                            {/* Hero Section */}
                            <div className="flex flex-col gap-4 text-center">
                                <h1 className="text-white text-4xl md:text-5xl font-bold">Exchange Rates</h1>
                                <p className="text-primary text-lg">Current Naira to USD Conversion</p>
                            </div>

                            {/* Current Rate Card */}
                            <div className="flex flex-col gap-6 rounded-xl border border-[#32673f] bg-[#193320] p-8">
                                <div className="text-center">
                                    <p className="text-white/60 text-sm mb-2">Current Exchange Rate</p>
                                    {loading ? (
                                        <p className="text-white text-2xl">Loading...</p>
                                    ) : (
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="text-center">
                                                <p className="text-primary text-5xl font-bold">₦{rate.toLocaleString()}</p>
                                                <p className="text-white/60 text-sm mt-2">Nigerian Naira</p>
                                            </div>
                                            <span className="text-white text-3xl">=</span>
                                            <div className="text-center">
                                                <p className="text-primary text-5xl font-bold">$1</p>
                                                <p className="text-white/60 text-sm mt-2">US Dollar</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
                                        <div>
                                            <p className="text-white/90 text-sm font-medium mb-1">Platform Currency</p>
                                            <p className="text-white/70 text-sm">
                                                All balances, transactions, and payments on Paypulse are displayed in US Dollars for your convenience.
                                                However, actual payments are processed in Nigerian Naira at the current exchange rate.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Conversion Examples */}
                            <div className="flex flex-col gap-6 rounded-xl border border-[#32673f] bg-[#193320] p-6">
                                <h2 className="text-white text-2xl font-bold">Quick Conversion Reference</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {examples.map((example, index) => (
                                        <div key={index} className="flex items-center justify-between bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-white font-mono">₦{example.naira.toLocaleString()}</span>
                                                <span className="text-white/40">→</span>
                                            </div>
                                            <span className="text-primary font-bold text-lg">${example.usd.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* How It Works */}
                            <div className="flex flex-col gap-6 rounded-xl border border-[#32673f] bg-[#193320] p-6">
                                <h2 className="text-white text-2xl font-bold">How Currency Works on Paypulse</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl mt-0.5">check_circle</span>
                                        <div>
                                            <h3 className="text-white font-bold mb-1">Display Currency</h3>
                                            <p className="text-white/70 text-sm">All amounts throughout the platform are shown in US Dollars ($) for easy understanding and international compatibility.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl mt-0.5">check_circle</span>
                                        <div>
                                            <h3 className="text-white font-bold mb-1">Payment Currency</h3>
                                            <p className="text-white/70 text-sm">When making payments through guiders or USDT, the equivalent amount in Nigerian Naira is calculated using the current exchange rate.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl mt-0.5">check_circle</span>
                                        <div>
                                            <h3 className="text-white font-bold mb-1">Fixed Rate</h3>
                                            <p className="text-white/70 text-sm">The exchange rate is set at ₦{rate.toLocaleString()} per $1 to ensure transparent and consistent pricing across all services.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Footer */}
                        <footer className="border-t border-solid border-[#23482c] px-4 md:px-10 py-10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <p className="text-white/60 text-sm">© 2025 Paypulse. All rights reserved.</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <Link className="text-white/80 text-sm hover:text-primary" href="#">Terms of Service</Link>
                                    <Link className="text-white/80 text-sm hover:text-primary" href="#">Privacy Policy</Link>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
