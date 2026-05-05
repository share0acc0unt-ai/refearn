'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatUSD } from "@/lib/currency";
import { SearchIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

interface Guider {
    _id: string;
    name: string;
    whatsapp: string;
    profilePhoto?: string;
    createdAt: string;
    successfulTransactions: number;
    totalValue: number;
}



export default function ChooseGuiderPage() {
    const router = useRouter();
    const [guiders, setGuiders] = useState<Guider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreditCodeModal, setShowCreditCodeModal] = useState(false);
    const [creditCode, setCreditCode] = useState('');
    const [pendingPayment, setPendingPayment] = useState<{ amount: number, adNumber: string } | null>(null);
    const [selectedGuider, setSelectedGuider] = useState<Guider | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem('pendingPayment');
        if (stored) {
            setPendingPayment(JSON.parse(stored));
        }
        fetchGuiders();
    }, []);

    const fetchGuiders = async () => {
        try {
            const response = await fetch('/api/guiders');
            if (response.ok) {
                const data = await response.json();
                setGuiders(data.guiders);
            }
        } catch (err) {
            console.error('Error fetching guiders:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredGuiders = guiders.filter(g => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                g.name.toLowerCase().includes(query) ||
                g.whatsapp.includes(query)
            );
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">
                Loading guiders...
            </div>
        );
    }

    const handleContactGuider = (guider: Guider, platform: 'whatsapp') => {
        const phone = guider.whatsapp.replace(/\s/g, '').replace(/\+/g, '');

        let message = '';
        if (pendingPayment) {
            message = `Hi! I need ${pendingPayment.amount.toLocaleString()} credit codes for advert/signup for AD no ${pendingPayment.adNumber}`;
        } else {
            message = "Hi! I'd like to purchase advertising credits on Paypulse.";
        }

        if (platform === 'whatsapp') {
            setSelectedGuider(guider);
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
            // Show credit code modal after opening WhatsApp
            setTimeout(() => setShowCreditCodeModal(true), 500);
        }
    };

    const handleCreditCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!creditCode) return;

        setIsSubmitting(true);

        // Simulate API call - replace with actual backend call
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Show success message for 2 seconds then redirect
        setTimeout(() => {
            sessionStorage.removeItem('pendingPayment');
            router.push('/');
        }, 2000);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
                        {/* TopNavBar */}
                        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 dark:border-b-[#23482c] px-4 md:px-10 py-3">
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
                                <Link href="/advertise">
                                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#23482c] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                        <span className="truncate">Back</span>
                                    </button>
                                </Link>
                            </div>
                        </header>

                        <main className="flex flex-col gap-10 py-10">
                            {/* Hero Section */}
                            <div className="flex flex-col gap-4 px-4 text-center items-center">
                                <div className="text-primary">
                                    <span className="material-symbols-outlined text-6xl">support_agent</span>
                                </div>
                                <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                                    Choose Your Guider
                                </h1>
                                <p className="text-white/80 text-base font-normal leading-normal max-w-[720px]">
                                    Our verified guiders are here to help you purchase credits and manage your advertising campaigns. Select a guider to get started.
                                </p>
                            </div>

                            {/* Search and Filter Section */}
                            <div className="flex flex-col md:flex-row items-center gap-4 px-4">
                                {/* Search Bar */}
                                <div className="flex-1 w-full">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Search by name or phone number..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Guiders Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                                {filteredGuiders.map((guider) => (
                                    <div
                                        key={guider._id}
                                        className="flex flex-col gap-4 rounded-xl border border-[#32673f] bg-[#193320] p-6 hover:border-primary transition-all"
                                    >
                                        {/* Guider Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {guider.profilePhoto ? (
                                                        <img
                                                            src={guider.profilePhoto}
                                                            alt={guider.name}
                                                            className="w-16 h-16 rounded-full bg-[#102215] border-2 border-primary object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-primary text-3xl">person</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-white text-lg font-bold">{guider.name}</h3>
                                                    <span className="text-white/50 text-xs font-medium">
                                                        Since {new Date(guider.createdAt).getFullYear()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                                <span className="text-white/80 text-sm">
                                                    {guider.successfulTransactions} successful transactions
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-sm">payments</span>
                                                <span className="text-white/80 text-sm">
                                                    Total value: {formatUSD(guider.totalValue)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contact Buttons */}
                                        <div className="flex flex-col gap-2 pt-2 border-t border-[#32673f]">
                                            <button
                                                onClick={() => handleContactGuider(guider, 'whatsapp')}
                                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-xl">chat</span>
                                                <span>Contact on WhatsApp</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredGuiders.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 px-4">
                                    <span className="material-symbols-outlined text-white/30 text-6xl mb-4">person_off</span>
                                    <p className="text-white/60 text-center">No guiders found matching your search.</p>
                                </div>
                            )}

                            {/* Info Section */}
                            <div className="flex flex-col gap-4 px-4 max-w-3xl mx-auto w-full">
                                <div className="bg-[#193320] border border-[#32673f] rounded-lg p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">info</span>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold mb-2">Important Information</h3>
                                            <ul className="text-[#92c9a0] text-sm space-y-1 list-disc list-inside">
                                                <li>All guiders are verified and trusted members of the Paypulse community</li>
                                                <li>Guiders are ranked by rating for your convenience</li>
                                                <li>After contacting a guider, you'll receive a credit code to submit</li>
                                                <li>Credits are added to your account immediately after code submission</li>
                                                <li>If you encounter any issues, please contact our support team</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Footer */}
                        <footer className="border-t border-solid border-white/10 dark:border-b-[#23482c] px-4 md:px-10 py-10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <p className="text-white/60 text-sm">© 2024 Paypulse. All rights reserved.</p>
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

            {/* Credit Code Modal */}
            {showCreditCodeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => !isSubmitting && !isSubmitted && setShowCreditCodeModal(false)}>
                    <div className="bg-[#193320] border border-[#32673f] rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        {!isSubmitted ? (
                            <>
                                <h3 className="text-white text-xl font-bold mb-2">Submit Credit Code</h3>
                                <p className="text-white/70 text-sm mb-4">
                                    Paste the credit code you received from <strong className="text-primary">{selectedGuider?.name}</strong>
                                </p>
                                <form onSubmit={handleCreditCodeSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Credit Code</label>
                                        <input
                                            type="text"
                                            value={creditCode}
                                            onChange={(e) => setCreditCode(e.target.value)}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                                            placeholder="XXXX-XXXX-XXXX-XXXX"
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <p className="text-white/50 text-xs">Paste the code you received from your guider</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreditCodeModal(false)}
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-3 bg-[#23482c] text-white rounded-lg font-bold hover:bg-[#23482c]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span>Submitting...</span>
                                            ) : (
                                                <>
                                                    <span>Submit</span>
                                                    <CheckIcon className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                    <CheckIcon className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-white text-xl font-bold">Submitted for Approval</h3>
                                <p className="text-white/70 text-sm text-center">Your credit code is being verified. Credits will be added to your account shortly.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
