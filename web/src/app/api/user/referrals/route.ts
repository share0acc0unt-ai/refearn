import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
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

        // Get pagination params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Get total count
        const totalReferrals = await User.countDocuments({ uplinerId: decoded.userId });

        // Get user's referrals (users who have this user as their upline)
        const referrals = await User.find({ uplinerId: decoded.userId })
            .select('name username whatsapp role referralBalance taskBalance createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const currentUser = await User.findById(decoded.userId);

        return NextResponse.json({
            referrals,
            referralCode: currentUser?.referralCode,
            totalReferrals,
            totalPages: Math.ceil(totalReferrals / limit),
        });
    } catch (error) {
        console.error('Referrals API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
