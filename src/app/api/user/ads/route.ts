import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { AdCampaign, User } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyJwt(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, targetUrl, budget, duration } = body;

        if (!title || !description || !budget || !duration) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (budget < 1000) {
            return NextResponse.json({ error: 'Minimum budget is ₦1,000' }, { status: 400 });
        }

        // Get user and check credits
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.credits < budget) {
            return NextResponse.json({
                error: 'Insufficient credits. Please purchase more credits to create this campaign.'
            }, { status: 400 });
        }

        // Deduct credits from user
        user.credits -= budget;
        await user.save();

        // Calculate end date based on duration
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        // Create ad campaign
        const campaign = await AdCampaign.create({
            userId: decoded.userId,
            title,
            description,
            targetUrl,
            budget,
            spent: 0,
            impressions: 0,
            clicks: 0,
            status: 'active',
            startDate,
            endDate,
        });

        return NextResponse.json({
            message: 'Ad campaign created successfully',
            campaign
        }, { status: 201 });
    } catch (error) {
        console.error('Create ad campaign error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Get user's campaigns
export async function GET() {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyJwt(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const campaigns = await AdCampaign.find({ userId: decoded.userId })
            .sort({ createdAt: -1 });

        return NextResponse.json({ campaigns });
    } catch (error) {
        console.error('Get campaigns error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
