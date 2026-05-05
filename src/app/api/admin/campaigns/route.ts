import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, AdCampaign } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';

// GET - Fetch all campaigns for admin with payment details
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from token
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyJwt(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await User.findById(decoded.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get pagination params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};
        if (status && status !== 'all') query.status = status;

        // Get total count
        const totalCampaigns = await AdCampaign.countDocuments(query);

        // Fetch campaigns with pagination
        const campaigns = await AdCampaign.find(query)
            .populate('userId', 'name email whatsapp')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            campaigns,
            total: totalCampaigns,
            totalPages: Math.ceil(totalCampaigns / limit),
        });

    } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns', details: error.message },
            { status: 500 }
        );
    }
}

// PUT - Approve or Reject a campaign
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from token
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyJwt(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await User.findById(decoded.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { campaignId, action } = body;

        if (!campaignId || !action) {
            return NextResponse.json({ error: 'Campaign ID and action are required' }, { status: 400 });
        }

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const campaign = await AdCampaign.findById(campaignId);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (action === 'approve') {
            campaign.status = 'active';
        } else if (action === 'reject') {
            campaign.status = 'rejected';
        }

        await campaign.save();

        return NextResponse.json({
            success: true,
            campaign
        });

    } catch (error: any) {
        console.error('Error updating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to update campaign', details: error.message },
            { status: 500 }
        );
    }
}
