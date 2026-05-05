import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ExchangeRate } from '@/lib/models';

// GET - Fetch current exchange rate
export async function GET() {
    try {
        await dbConnect();

        // Try to get the rate from database
        let rateDoc = await ExchangeRate.findOne().sort({ createdAt: -1 });

        // If no rate exists, create default one
        if (!rateDoc) {
            rateDoc = await ExchangeRate.create({
                nairaPerDollar: 1000,
                lastUpdated: new Date()
            });
        }

        return NextResponse.json({
            rate: rateDoc.nairaPerDollar,
            lastUpdated: rateDoc.lastUpdated
        });

    } catch (error: any) {
        console.error('Error fetching exchange rate:', error);
        // Return default rate if error
        return NextResponse.json({
            rate: 1000,
            lastUpdated: new Date()
        });
    }
}
