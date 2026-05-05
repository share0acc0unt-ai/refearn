'use client';

import { useState, useEffect } from 'react';

interface CurrencyCalculatorProps {
    onAmountChange: (usdAmount: string) => void;
    label?: string;
    placeholder?: string;
}

export default function CurrencyCalculator({ onAmountChange, label = "Amount", placeholder = "Enter amount" }: CurrencyCalculatorProps) {
    const [rate, setRate] = useState<number>(1000);
    const [localAmount, setLocalAmount] = useState('');
    const [usdAmount, setUsdAmount] = useState('');

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const response = await fetch('/api/exchange-rate');
                if (response.ok) {
                    const data = await response.json();
                    setRate(data.rate);
                }
            } catch (err) {
                console.error('Failed to fetch exchange rate:', err);
            }
        };
        fetchRate();
    }, []);

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalAmount(val);
        if (val && !isNaN(parseFloat(val))) {
            const usd = (parseFloat(val) / rate).toFixed(2);
            setUsdAmount(usd);
            onAmountChange(val); // Pass the local amount back
        } else {
            setUsdAmount('');
            onAmountChange('');
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-medium">Enter amount in your local currency (₦)</label>
                <input
                    type="number"
                    value={localAmount}
                    onChange={handleLocalChange}
                    className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter amount in Naira"
                />
            </div>

            {usdAmount && (
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/20 border border-primary animate-pulse">
                    <p className="text-primary/70 text-xs uppercase tracking-widest font-bold">Equivalent in USD</p>
                    <p className="text-white text-4xl font-black">${usdAmount}</p>
                    <p className="text-white/40 text-[10px] mt-1">Rate: ₦{rate.toLocaleString()} / $1</p>
                </div>
            )}
        </div>
    );
}
