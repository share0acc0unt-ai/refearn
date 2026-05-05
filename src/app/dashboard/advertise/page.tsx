'use client';

import Link from "next/link";
import { useState } from "react";
import { formatUSD } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

export default function AdvertisePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetUrl: '',
        action: 'visit',
        targetedReach: '',
        duration: '7',
        whatsappNumber: ''
    });

    const actions = [
        { value: 'visit', label: 'Visit (my page/website)', unit: '10 credits per visit' },
        { value: 'follow', label: 'Follow/Subscribe', unit: '15 credits per follow' },
        { value: 'like', label: 'Like', unit: '15 credits per like' },
        { value: 'comment', label: 'Comment', unit: '20 credits per comment' },
        { value: 'visit-follow-like-comment', label: 'Visit-Follow/Subscribe-Like-Comment', unit: '25 credits per action' },
        { value: 'share-status', label: 'Share/Post my content on your status', unit: '50 credits per post' },
        { value: 'report-user', label: 'Report this user', unit: '100 credits per report' },
        { value: 'drag-user', label: 'Drag this user', unit: '100 credits per drag' },
        { value: 'trend-twitter', label: 'Make me trend on Twitter', unit: '100 credits per trend' },
        { value: 'make-promotional-video', label: 'Make Promotional Video', unit: '10,000 credits per video' }
    ];

    const durations = [
        { value: '1', label: '1 day' },
        { value: '2', label: '2 days' },
        { value: '3', label: '3 days' },
        { value: '4', label: '4 days' },
        { value: '5', label: '5 days' },
        { value: '6', label: '6 days' },
        { value: '7', label: '7 days' },
        { value: '14', label: '14 days' },
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
        { value: '90', label: '90 days' }
    ];

    // Pricing based on action type
    const calculateBill = () => {
        const reach = parseInt(formData.targetedReach) || 0;
        const action = formData.action;

        // Unit rates per action (derived from bulk pricing)
        switch (action) {
            case 'make-promotional-video':
                // ₦10,000 per video
                return reach * 10000;

            case 'share-status':
                // ₦5,000 per 100 person post -> 50 per unit
                return reach * 50;

            case 'report-user':
            case 'drag-user':
                // ₦10,000 per 100 person report/drag -> 100 per unit
                return reach * 100;

            case 'trend-twitter':
                // ₦100,000 per thousand trend -> 100 per unit
                return reach * 100;

            case 'visit':
                // ₦10,000 per thousand visit -> 10 per unit
                return reach * 10;

            case 'follow':
                // ₦15,000 per thousand Follow/subscribe -> 15 per unit
                return reach * 15;

            case 'like':
                // ₦15,000 per thousand like -> 15 per unit
                return reach * 15;

            case 'comment':
                // ₦20,000 per thousand comment -> 20 per unit
                return reach * 20;

            case 'visit-follow-like-comment':
                // ₦25,000 per thousand Visit-Follow/Subscribe-Like-Comment -> 25 per unit
                return reach * 25;

            default:
                return reach * 10;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const bill = calculateBill();
        if (bill < 10) {
            alert('Minimum budget is 10 credits. Please increase your targeted reach or duration.');
            return;
        }

        // Generate a random AD number
        const adNumber = 'AD' + Math.random().toString(36).substr(2, 8).toUpperCase();

        // Store campaign data and navigate to payment page
        sessionStorage.setItem('campaignData', JSON.stringify({
            ...formData,
            billAmount: bill,
            adNumber
        }));

        router.push('/dashboard/advertise/payment');
    };

    const bill = calculateBill();
    const isValidBill = bill >= 10;

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
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
                                <Link href="/">
                                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#23482c] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                        <span className="truncate">Back to Home</span>
                                    </button>
                                </Link>
                            </div>
                        </header>

                        <main className="flex flex-col gap-8 py-10 px-4">
                            {/* Hero Section */}
                            <div className="flex flex-col gap-2 text-left">
                                <h1 className="text-white text-[32px] font-bold leading-tight">Create Ad Campaign</h1>
                                <p className="text-primary text-base font-normal">Promote your content and reach more users</p>
                            </div>

                            {/* Campaign Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-6 rounded-xl border border-[#32673f] bg-[#193320] p-6 md:p-8">
                                    <h2 className="text-white text-xl font-bold">Campaign Details</h2>

                                    {/* Campaign Title */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Campaign Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="e.g., Subscribe to my YouTube channel"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
                                            placeholder="Describe your campaign and what users should do..."
                                            required
                                        />
                                    </div>

                                    {/* Target URL */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Target URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={formData.targetUrl}
                                            onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="https://youtube.com/your-channel"
                                        />
                                        <p className="text-white/50 text-xs">Social media page link, website link, or WhatsApp link</p>
                                    </div>

                                    {/* Action */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Action</label>
                                        <select
                                            value={formData.action}
                                            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        >
                                            {actions.map(action => (
                                                <option key={action.value} value={action.value}>{action.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-white/50 text-xs">Cost: {actions.find(a => a.value === formData.action)?.unit}</p>
                                    </div>

                                    {/* Targeted Reach */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Targeted Count</label>
                                        <input
                                            type="number"
                                            value={formData.targetedReach}
                                            onChange={(e) => setFormData({ ...formData, targetedReach: e.target.value })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Number of persons/actions"
                                            min="1"
                                            required
                                        />
                                        <p className="text-white/50 text-xs">
                                            {formData.action === 'make-promotional-video'
                                                ? 'Number of videos to create'
                                                : 'Number of people/actions'}
                                        </p>
                                    </div>

                                    {/* WhatsApp Number */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Your WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            value={formData.whatsappNumber}
                                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="+234 800 000 0000"
                                            required
                                        />
                                        <p className="text-white/50 text-xs">We'll contact you for campaign updates</p>
                                    </div>

                                    {/* Budget Display */}
                                    {formData.targetedReach && (
                                        <div className="flex flex-col gap-2 p-4 bg-[#102215] border border-[#32673f] rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/80 text-sm">Estimated Budget:</span>
                                                <span className="text-white text-lg font-bold">{formatUSD(bill)}</span>
                                            </div>
                                            <p className="text-primary text-xs">Minimum: 10 credits</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!isValidBill}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>Create Campaign</span>
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </button>

                                    {!isValidBill && formData.targetedReach && (
                                        <p className="text-red-500 text-sm text-center">
                                            Insufficient credits. You need at least 10 credits to create a campaign.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </main>

                        {/* Footer */}
                        <footer className="border-t border-solid border-white/10 dark:border-b-[#23482c] px-4 md:px-10 py-10">
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
