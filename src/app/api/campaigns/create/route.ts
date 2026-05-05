import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { AdCampaign, User } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';

// POST - Create new campaign after payment
export async function POST(request: NextRequest) {
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
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const {
            title,
            description,
            targetUrl,
            action,
            targetedReach,
            whatsappNumber,
            billAmount,
            adNumber,
            creditCode,
            paymentMethod
        } = body;

        // Validate required fields
        if (!title || !description || !action || !targetedReach || !whatsappNumber || !billAmount || !adNumber) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Map old action field to platform and actionType
        // Extract platform from targetUrl or use default
        let platform = 'other';
        if (targetUrl) {
            if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) platform = 'youtube';
            else if (targetUrl.includes('instagram.com')) platform = 'instagram';
            else if (targetUrl.includes('twitter.com') || targetUrl.includes('x.com')) platform = 'twitter';
            else if (targetUrl.includes('facebook.com')) platform = 'facebook';
            else if (targetUrl.includes('tiktok.com')) platform = 'tiktok';
        }

        // Create campaign
        const campaign = await AdCampaign.create({
            userId: user._id,
            contactInfo: whatsappNumber,
            platform,
            actionType: action,
            link: targetUrl || '',
            targetCount: parseInt(targetedReach),
            costPerAction: Math.ceil(billAmount / parseInt(targetedReach)),
            totalCost: billAmount,
            creditCode: creditCode || adNumber, // Use provided credit code or adNumber as fallback
            status: 'pending', // Admin needs to approve
        });

        return NextResponse.json({
            success: true,
            campaign: {
                _id: campaign._id,
                adNumber: adNumber,
                status: campaign.status
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign', details: error.message },
            { status: 500 }
        );
    }
}
