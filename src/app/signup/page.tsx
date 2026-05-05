'use client';

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatUSD } from "@/lib/currency";
import { countries } from "@/lib/countries";

interface Plan {
    _id: string;
    name: string;
    displayName: string;
    price: number;
    features: string[];
}

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        phone: '',
        country: 'Nigeria',
        countryCode: '+234',
        password: '',
        confirmPassword: '',
        referralCode: searchParams.get('ref') || '',
        creditCode: '',
        planName: 'lite',
    });

    const [plans, setPlans] = useState<Plan[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [whatsappChecking, setWhatsappChecking] = useState(false);
    const [creditCodeChecking, setCreditCodeChecking] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [whatsappAvailable, setWhatsappAvailable] = useState<boolean | null>(null);
    const [creditCodeValid, setCreditCodeValid] = useState<boolean | null>(null);
    const [creditCodeMessage, setCreditCodeMessage] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await fetch('/api/plans');
            const data = await response.json();
            setPlans(data.plans || []);
        } catch (err) {
            console.error('Error fetching plans:', err);
        }
    };

    const checkUsernameAvailability = async (username: string) => {
        if (!username || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        setUsernameChecking(true);
        try {
            const response = await fetch(`/api/auth/check-availability?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            setUsernameAvailable(data.available);
        } catch (err) {
            console.error('Error checking username:', err);
        } finally {
            setUsernameChecking(false);
        }
    };

    const checkWhatsappAvailability = async (phone: string, cCode: string) => {
        if (!phone || phone.length < 7) {
            setWhatsappAvailable(null);
            return;
        }

        const fullNumber = (cCode + phone.replace(/^0+/, '')).replace(/\D/g, '');

        setWhatsappChecking(true);
        try {
            const response = await fetch(`/api/auth/check-availability?whatsapp=${encodeURIComponent(fullNumber)}`);
            const data = await response.json();
            setWhatsappAvailable(data.available);
        } catch (err) {
            console.error('Error checking whatsapp:', err);
        } finally {
            setWhatsappChecking(false);
        }
    };

    const validateCreditCode = async (code: string, planName: string) => {
        if (!code || code.length < 3) {
            setCreditCodeValid(null);
            setCreditCodeMessage('');
            return;
        }

        const selectedPlan = plans.find(p => p.name === planName);
        if (!selectedPlan) return;

        setCreditCodeChecking(true);
        try {
            const response = await fetch(`/api/auth/validate-credit-code?code=${encodeURIComponent(code)}&planPrice=${selectedPlan.price}`);
            const data = await response.json();
            setCreditCodeValid(data.valid);
            setCreditCodeMessage(data.message);
        } catch (err) {
            console.error('Error validating credit code:', err);
        } finally {
            setCreditCodeChecking(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.username) {
                checkUsernameAvailability(formData.username);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.username]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.phone) {
                checkWhatsappAvailability(formData.phone, formData.countryCode);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.phone, formData.countryCode]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.creditCode) {
                validateCreditCode(formData.creditCode, formData.planName);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.creditCode, formData.planName, plans]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (usernameAvailable === false) {
            setError('Username is already taken');
            return;
        }

        if (whatsappAvailable === false) {
            setError('WhatsApp number is already registered');
            return;
        }

        if (creditCodeValid === false) {
            setError('Credit code is invalid or insufficient');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    whatsapp: (formData.countryCode + formData.phone.replace(/^0+/, '')).replace(/\D/g, ''),
                    country: formData.country,
                    countryCode: formData.countryCode,
                    password: formData.password,
                    referralCode: formData.referralCode || undefined,
                    creditCode: formData.creditCode,
                    planName: formData.planName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const selectedPlan = plans.find(p => p.name === formData.planName);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark overflow-x-hidden font-display">
            <div className="flex h-full w-full items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-8">
                        {/* Logo */}
                        <div className="flex justify-center">
                            <Link href="/" className="flex items-center gap-2 text-primary">
                                <div className="size-8">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_6_543)">
                                            <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                                            <path clipRule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252C29.1604 40.8128 31.5022 42.252 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fillRule="evenodd"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_6_543"><rect fill="white" height="48" width="48"></rect></clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold">Paypulse</h1>
                            </Link>
                        </div>

                        {/* Form Card */}
                        <div className="flex flex-col gap-6 rounded-xl border border-[#32673f] bg-[#193320] p-8">
                            <div className="flex flex-col gap-2 text-center">
                                <h2 className="text-white text-2xl font-bold">Create Account</h2>
                                <p className="text-white/70 text-sm">Join Paypulse and start earning today</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 pr-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="johndoe"
                                            required
                                        />
                                        {usernameChecking && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">Checking...</span>
                                        )}
                                        {!usernameChecking && usernameAvailable === true && (
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xl">check_circle</span>
                                        )}
                                        {!usernameChecking && usernameAvailable === false && (
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">cancel</span>
                                        )}
                                    </div>
                                    {usernameAvailable === false && (
                                        <p className="text-red-400 text-xs">Username is already taken</p>
                                    )}

                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Country</label>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => {
                                            const selected = countries.find(c => c.name === e.target.value);
                                            setFormData({
                                                ...formData,
                                                country: e.target.value,
                                                countryCode: selected?.code || ''
                                            });
                                        }}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    >
                                        <option value="" disabled>Select your country</option>
                                        {countries.map((c) => (
                                            <option key={c.name} value={c.name}>
                                                {c.name} ({c.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">WhatsApp Number</label>
                                    <div className="relative">
                                        <div className="flex">
                                            <div className="flex items-center justify-center rounded-l-lg border-y border-l border-[#32673f] bg-[#0c1a10] px-3 text-white/50 min-w-[60px]">
                                                {formData.countryCode}
                                            </div>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                                className="w-full rounded-r-lg border border-[#32673f] bg-[#102215] px-4 py-3 pr-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="800 000 0000"
                                                required
                                            />
                                        </div>
                                        {whatsappChecking && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">Checking...</span>
                                        )}
                                        {!whatsappChecking && whatsappAvailable === true && (
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xl">check_circle</span>
                                        )}
                                        {!whatsappChecking && whatsappAvailable === false && (
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">cancel</span>
                                        )}
                                    </div>
                                    {whatsappAvailable === false && (
                                        <p className="text-red-400 text-xs">WhatsApp number is already registered</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Select Plan</label>
                                    <select
                                        value={formData.planName}
                                        onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    >
                                        {plans.map((plan) => (
                                            <option key={plan._id} value={plan.name}>
                                                {plan.displayName} - {formatUSD(plan.price)}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedPlan && (
                                        <p className="text-white/50 text-xs">
                                            {selectedPlan.features.join(' • ')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Credit Code <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.creditCode}
                                            onChange={(e) => setFormData({ ...formData, creditCode: e.target.value.toUpperCase() })}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 pr-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                                            placeholder="Enter credit code"
                                            required
                                        />
                                        {creditCodeChecking && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">Validating...</span>
                                        )}
                                        {!creditCodeChecking && creditCodeValid === true && (
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xl">check_circle</span>
                                        )}
                                        {!creditCodeChecking && creditCodeValid === false && (
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">cancel</span>
                                        )}
                                    </div>
                                    {creditCodeMessage && (
                                        <p className={`text-xs ${creditCodeValid ? 'text-green-400' : 'text-red-400'}`}>
                                            {creditCodeMessage}
                                        </p>
                                    )}
                                    <p className="text-white/50 text-xs">Contact a guider to obtain a credit code</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white text-sm font-medium">Referral Code (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.referralCode}
                                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                                        placeholder="Enter referral code"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || usernameAvailable === false || whatsappAvailable === false || creditCodeValid === false}
                                    className="w-full rounded-lg bg-primary px-4 py-3 text-[#112215] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            <div className="text-center">
                                <p className="text-white/70 text-sm">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-primary hover:underline font-medium">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full bg-background-dark flex items-center justify-center text-white">Loading...</div>}>
            <SignupContent />
        </Suspense>
    );
}
