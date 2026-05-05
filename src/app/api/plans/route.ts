import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Plan } from '@/lib/models';

// GET - Get all active plans
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

        return NextResponse.json({ plans });

    } catch (error: any) {
        console.error('Error fetching plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch plans', details: error.message },
            { status: 500 }
        );
    }
}
