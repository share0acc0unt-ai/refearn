'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";
import { useRouter } from "next/navigation";

export default function GenerateCodePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        amount: '',
        purpose: 'signup',
    });

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (!response.ok) {
                router.push('/login');
                return;
            }
            const data = await response.json();
            if (data.user.role !== 'guider') {
                router.push('/dashboard');
                return;
            }
            setUser(data.user);
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (user && amount > user.credits) {
            setError(`Insufficient credits. Available: ${formatUSD(user.credits)}`);
            return;
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/guider/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    purpose: formData.purpose,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate code');
            }

            setSuccess(`Code generated successfully: ${data.creditCode.code}`);
            setFormData({ amount: '', purpose: 'signup' });

            // Update user credits
            setUser({ ...user, credits: data.remainingCredits });

            // Auto-clear success message after 5 seconds
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-white text-xl">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-background-dark">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">Generate Credit Code</h1>
                    <p className="text-white/60 text-sm sm:text-base mt-2">
                        Create credit codes for signups or advertisements
                    </p>
                </div>

                {/* Credits Balance */}
                <div className="mb-6 rounded-xl border border-[#32673f] bg-[#193320] p-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">account_balance_wallet</span>
                        <div>
                            <p className="text-white/70 text-sm">Available Credits</p>
                            <p className="text-white text-3xl font-bold">{formatUSD(user?.credits || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>{success}</span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">error</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="rounded-xl border border-[#32673f] bg-[#193320] p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="text-white text-sm font-medium mb-2 block">Purpose</label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="signup">Signup Credit Code</option>
                                <option value="advertisement">Advertisement Credit Code</option>
                            </select>
                            <p className="text-white/50 text-xs mt-2">
                                {formData.purpose === 'signup'
                                    ? 'For new user registrations (10% commission on usage)'
                                    : 'For advertisement payments (5% commission on usage)'}
                            </p>
                        </div>

                        <div>
                            <label className="text-white text-sm font-medium mb-2 block">Amount ($)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter amount"
                                min="1"
                                step="1"
                                required
                            />
                            <p className="text-white/50 text-xs mt-2">
                                This amount will be deducted from your credits
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 rounded-lg bg-primary px-4 py-3 text-[#112215] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Generating...' : 'Generate Code'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/guider/codes')}
                                className="px-6 py-3 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                            >
                                View All Codes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-400 text-2xl">person_add</span>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">Signup Codes</h3>
                                <p className="text-white/60 text-xs">Earn 10% commission when users sign up using your code</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#32673f] bg-[#193320] p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-400 text-2xl">campaign</span>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">Advertisement Codes</h3>
                                <p className="text-white/60 text-xs">Earn 5% commission when users pay for ads using your code</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
