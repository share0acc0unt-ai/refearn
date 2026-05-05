import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, CreditCode, AdCampaign, Transaction } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import Withdrawal from '@/models/Withdrawal';

// GET - Fetch detailed user information
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
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

        const admin = await User.findById(decoded.userId);
        if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const params = await context.params;
        const userId = params.id;

        // Fetch user
        const user: any = await User.findById(userId).lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch transactions (last 20)
        const transactions = await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Fetch withdrawals
        const withdrawals = await Withdrawal.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        // Fetch referrals (users who have this user as their upliner)
        const referrals = await User.find({ uplinerId: userId })
            .select('name username createdAt')
            .lean();

        // Fetch campaigns
        const campaigns = await AdCampaign.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        // Fetch credit codes (if guider)
        let creditCodes: any[] = [];
        if (user.role === 'guider') {
            creditCodes = await CreditCode.find({ generatedBy: userId })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();
        }

        return NextResponse.json({
            user,
            transactions,
            withdrawals,
            referrals,
            campaigns,
            creditCodes
        });

    } catch (error: any) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details', details: error.message },
            { status: 500 }
        );
    }
}
