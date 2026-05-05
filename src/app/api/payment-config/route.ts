import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentConfig from '@/models/PaymentConfig';

// GET - Get payment configuration
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (key) {
            // Get specific config
            const config = await PaymentConfig.findOne({ key });
            if (!config) {
                return NextResponse.json(
                    { error: 'Configuration not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ config });
        } else {
            // Get all configs
            const configs = await PaymentConfig.find();
            return NextResponse.json({ configs });
        }

    } catch (error: any) {
        console.error('Error fetching payment config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment configuration', details: error.message },
            { status: 500 }
        );
    }
}

// POST - Update payment configuration
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { key, value, description } = body;

        if (!key || !value) {
            return NextResponse.json(
                { error: 'Missing required fields: key and value' },
                { status: 400 }
            );
        }

        const config = await PaymentConfig.findOneAndUpdate(
            { key },
            { key, value, description },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            config,
        });

    } catch (error: any) {
        console.error('Error updating payment config:', error);
        return NextResponse.json(
            { error: 'Failed to update payment configuration', details: error.message },
            { status: 500 }
        );
    }
}

