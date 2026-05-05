import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/models/Campaign';

// Generate unique AD number
function generateAdNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'AD';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['title', 'description', 'action', 'targetedReach', 'duration', 'whatsappNumber', 'billAmount'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate minimum budget
        if (body.billAmount < 10) {
            return NextResponse.json(
                { error: 'Minimum budget is 10 credits' },
                { status: 400 }
            );
        }

        // Create campaign
        const campaign = await Campaign.create({
            adNumber: generateAdNumber(),
            title: body.title,
            description: body.description,
            targetUrl: body.targetUrl || undefined,
            action: body.action,
            targetedReach: parseInt(body.targetedReach),
            duration: parseInt(body.duration),
            whatsappNumber: body.whatsappNumber,
            billAmount: parseInt(body.billAmount),
            status: 'PENDING_PAYMENT',
            userId: body.userId || undefined,
        });

        return NextResponse.json({
            success: true,
            campaign,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign', details: error.message },
            { status: 500 }
        );
    }
}

// GET - Get campaign(s)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const adNumber = searchParams.get('adNumber');
        const userId = searchParams.get('userId');

        if (adNumber) {
            // Get specific campaign by AD number
            const campaign = await Campaign.findOne({ adNumber });
            if (!campaign) {
                return NextResponse.json(
                    { error: 'Campaign not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ campaign });
        } else if (userId) {
            // Get campaigns for specific user
            const campaigns = await Campaign.find({ userId }).sort({ createdAt: -1 });
            return NextResponse.json({ campaigns });
        } else {
            // Get all campaigns
            const campaigns = await Campaign.find().sort({ createdAt: -1 });
            return NextResponse.json({ campaigns });
        }

    } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns', details: error.message },
            { status: 500 }
        );
    }
}

