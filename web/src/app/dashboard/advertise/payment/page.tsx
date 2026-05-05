'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckIcon, CopyIcon } from "lucide-react";

interface CampaignData {
    title: string;
    description: string;
    targetUrl: string;
    action: string;
    targetedReach: string;
    duration: string;
    whatsappNumber: string;
    billAmount: number;
    adNumber: string;
}

export default function PaymentPage() {
    const router = useRouter();
    const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<'usdt' | 'guider' | null>(null);
    const [copied, setCopied] = useState(false);
    const [showTxHashModal, setShowTxHashModal] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [usdtWalletAddress, setUsdtWalletAddress] = useState('');
    const [network, setNetwork] = useState('TRC20');

    useEffect(() => {
        const stored = sessionStorage.getItem('campaignData');
        if (stored) {
            setCampaignData(JSON.parse(stored));
        } else {
            router.push('/advertise');
        }
    }, [router]);

    useEffect(() => {
        const fetchPaymentConfig = async () => {
            try {
                const response = await fetch('/api/payment-config');
                if (response.ok) {
                    const data = await response.json();
                    const configs = data.configs || [];
                    const usdtConfig = configs.find((c: any) => c.key === 'usdt_address');
                    const networkConfig = configs.find((c: any) => c.key === 'usdt_network');

                    if (usdtConfig) setUsdtWalletAddress(usdtConfig.value);
                    if (networkConfig) setNetwork(networkConfig.value);
                }
            } catch (err) {
                console.error('Error fetching payment config:', err);
            }
        };
        fetchPaymentConfig();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(usdtWalletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTxHashSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!txHash || !campaignData) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/campaigns/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...campaignData,
                    creditCode: txHash,
                    paymentMethod: selectedMethod
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.error || 'Failed to create campaign');
                setIsSubmitting(false);
                return;
            }

            setIsSubmitting(false);
            setIsSubmitted(true);

            // Show success message for 2 seconds then redirect
            setTimeout(() => {
                sessionStorage.removeItem('campaignData');
                router.push('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleBrowseGuiders = () => {
        if (campaignData) {
            sessionStorage.setItem('pendingPayment', JSON.stringify({
                amount: campaignData.billAmount,
                adNumber: campaignData.adNumber
            }));
        }
        router.push('/choose-guider');
    };

    if (!campaignData) {
        return <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">Loading...</div>;
    }

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
                                <Link href="/advertise">
                                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#23482c] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                        <span className="truncate">Back</span>
                                    </button>
                                </Link>
                            </div>
                        </header>

                        <main className="flex flex-col gap-8 py-10 px-4">
                            {/* Campaign Summary */}
                            <div className="flex flex-col gap-6 rounded-xl border border-[#32673f] bg-[#193320] p-6">
                                <h2 className="text-white text-xl font-bold">Campaign Summary</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-sm">Campaign Title</p>
                                        <p className="text-white font-medium">{campaignData.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">AD Number</p>
                                        <p className="text-primary font-bold">{campaignData.adNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Targeted Reach</p>
                                        <p className="text-white font-medium">{campaignData.targetedReach} persons</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Duration</p>
                                        <p className="text-white font-medium">{campaignData.duration} days</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-white/60 text-sm">Total Amount</p>
                                        <p className="text-white text-2xl font-bold">{campaignData.billAmount.toLocaleString()} credits</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="flex flex-col gap-6">
                                <h2 className="text-white text-2xl font-bold">Choose Payment Method</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pay with USDT */}
                                    <div
                                        onClick={() => setSelectedMethod('usdt')}
                                        className={`flex flex-col gap-6 rounded-xl border-2 p-6 cursor-pointer transition-all ${selectedMethod === 'usdt'
                                            ? 'border-primary bg-[#193320]'
                                            : 'border-[#32673f] bg-[#193320] hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-primary mt-1">
                                                <span className="material-symbols-outlined text-4xl">currency_bitcoin</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white text-xl font-bold mb-2">Pay with USDT</h3>
                                                <p className="text-[#92c9a0] text-sm">
                                                    Send payment directly to our USDT wallet address
                                                </p>
                                            </div>
                                        </div>

                                        {selectedMethod === 'usdt' && (
                                            <div className="flex flex-col gap-4 pt-4 border-t border-[#32673f]">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-white text-sm font-medium">Amount (Credits)</label>
                                                    <input
                                                        type="text"
                                                        value={campaignData.billAmount.toLocaleString()}
                                                        disabled
                                                        className="w-full rounded-lg border border-[#32673f] bg-[#0a1410] px-4 py-3 text-white/80 font-bold cursor-not-allowed"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-white text-sm font-medium">USDT Wallet Address</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={usdtWalletAddress}
                                                            readOnly
                                                            className="flex-1 rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white/80 text-sm focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={copyToClipboard}
                                                            type="button"
                                                            className="flex items-center gap-2 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                                        >
                                                            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                                                            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                                    <div className="flex items-start gap-2">
                                                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
                                                        <div className="flex-1">
                                                            <p className="text-white/90 text-sm font-medium mb-1">Important Instructions:</p>
                                                            <ul className="text-[#92c9a0] text-xs space-y-1 list-disc list-inside">
                                                                <li>Send the exact amount to the wallet address above</li>
                                                                <li>Use {network} network for USDT transfers</li>
                                                                <li>After sending, click "I have Paid" and submit your transaction hash</li>
                                                                <li>Your campaign will be activated after payment verification</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setShowTxHashModal(true)}
                                                    type="button"
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                                >
                                                    <span>I have Paid</span>
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Get Credit from Guider */}
                                    <div
                                        onClick={() => setSelectedMethod('guider')}
                                        className={`flex flex-col gap-6 rounded-xl border-2 p-6 cursor-pointer transition-all ${selectedMethod === 'guider'
                                            ? 'border-primary bg-[#193320]'
                                            : 'border-[#32673f] bg-[#193320] hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-primary mt-1">
                                                <span className="material-symbols-outlined text-4xl">support_agent</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white text-xl font-bold mb-2">Get Credit from Guider</h3>
                                                <p className="text-[#92c9a0] text-sm">
                                                    Purchase credits directly from a verified guider
                                                </p>
                                            </div>
                                        </div>

                                        {selectedMethod === 'guider' && (
                                            <div className="flex flex-col gap-4 pt-4 border-t border-[#32673f]">
                                                <div className="bg-[#102215] border border-[#32673f] rounded-lg p-4">
                                                    <div className="flex items-start gap-2">
                                                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">how_to_reg</span>
                                                        <div className="flex-1">
                                                            <p className="text-white/90 text-sm font-medium mb-1">How it works:</p>
                                                            <ul className="text-[#92c9a0] text-xs space-y-1 list-disc list-inside">
                                                                <li>Browse our list of verified guiders</li>
                                                                <li>Contact your chosen guider via WhatsApp or Telegram</li>
                                                                <li>Purchase {campaignData.billAmount.toLocaleString()} credits for AD {campaignData.adNumber}</li>
                                                                <li>Receive credit code and submit for instant activation</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleBrowseGuiders}
                                                    type="button"
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                                >
                                                    <span>Browse Guiders</span>
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
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

            {/* Transaction Hash Modal */}
            {showTxHashModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => !isSubmitting && !isSubmitted && setShowTxHashModal(false)}>
                    <div className="bg-[#193320] border border-[#32673f] rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        {!isSubmitted ? (
                            <>
                                <h3 className="text-white text-xl font-bold mb-4">Submit Transaction Hash</h3>
                                <form onSubmit={handleTxHashSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Transaction Hash</label>
                                        <input
                                            type="text"
                                            value={txHash}
                                            onChange={(e) => setTxHash(e.target.value)}
                                            className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Paste your transaction hash here"
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <p className="text-white/50 text-xs">Copy the transaction hash from your USDT wallet</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowTxHashModal(false)}
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-3 bg-[#23482c] text-white rounded-lg font-bold hover:bg-[#23482c]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-3 bg-primary text-[#112215] rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
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
                                <p className="text-white/70 text-sm text-center">Your transaction is being verified. We'll notify you once approved.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
