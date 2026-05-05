import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Guider from '@/models/Guider';
import { ExchangeRate } from '@/lib/models';

export const dynamic = 'force-dynamic';

// GET - Get guiders ranked by successful transactions
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Fetch exchange rate to calculate dynamic values
        const rateDoc = await ExchangeRate.findOne({});
        const rate = rateDoc ? rateDoc.nairaPerDollar : 1500;

        // Fetch all guiders from the Guider collection
        const guiders = await Guider.find({}).lean();

        // Format guiders to match the frontend expectations
        const formattedGuiders = guiders.map((guider: any) => ({
            _id: guider._id,
            name: guider.name,
            whatsapp: guider.whatsapp || guider.phoneNumber,
            profilePhoto: guider.avatar,
            createdAt: guider.createdAt,
            successfulTransactions: guider.totalTransactions || 0,
            // Calculate total value dynamically using the DB rate (assuming average 10 USD per transaction)
            totalValue: (guider.totalTransactions || 0) * (rate * 10)
        }));

        // Sort by successful transactions (descending)
        formattedGuiders.sort((a, b) => b.successfulTransactions - a.successfulTransactions);

        return NextResponse.json({
            guiders: formattedGuiders
        });

    } catch (error: any) {
        console.error('Error fetching guiders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch guiders', details: error.message },
            { status: 500 }
        );
    }
}
