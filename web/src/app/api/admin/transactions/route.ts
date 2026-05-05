import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Transaction, User } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyJwt(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const admin = await User.findById(decoded.userId);
        if (!admin || !['ADMIN', 'SUPERADMIN'].includes(admin.role?.toUpperCase())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const balanceType = searchParams.get('balanceType');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query: any = {};
        if (type && type !== 'all') query.type = type;
        if (status && status !== 'all') query.status = status;
        if (balanceType && balanceType !== 'all') query.balanceType = balanceType;

        const total = await Transaction.countDocuments(query);
        const skip = (page - 1) * limit;
        const transactions = await Transaction.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Transactions API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyJwt(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const admin = await User.findById(decoded.userId);
        if (!admin || !['ADMIN', 'SUPERADMIN'].includes(admin.role?.toUpperCase())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { transactionId, action } = body; // action: 'approve' | 'reject'

        if (!transactionId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.status !== 'pending') {
            return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
        }

        if (action === 'approve') {
            transaction.status = 'completed';

            // Update user balance for credit purchases
            if (transaction.type === 'credit_purchase') {
                const user = await User.findById(transaction.userId);
                if (user) {
                    user.credits = (user.credits || 0) + transaction.amount;
                    await user.save();
                }
            }

            // Update the withdrawal record status if this is a withdrawal transaction
            if (transaction.type === 'withdrawal' && transaction.metadata?.get('withdrawalId')) {
                const Withdrawal = (await import('@/models/Withdrawal')).default;
                const withdrawal = await Withdrawal.findById(transaction.metadata.get('withdrawalId'));
                if (withdrawal) {
                    withdrawal.status = 'approved';
                    withdrawal.processedAt = new Date();
                    withdrawal.processedBy = admin._id;
                    await withdrawal.save();
                }
            }
        } else if (action === 'reject') {
            transaction.status = 'failed';

            // Update the withdrawal record status if this is a withdrawal transaction
            if (transaction.type === 'withdrawal' && transaction.metadata?.get('withdrawalId')) {
                const Withdrawal = (await import('@/models/Withdrawal')).default;
                const withdrawal = await Withdrawal.findById(transaction.metadata.get('withdrawalId'));
                if (withdrawal) {
                    withdrawal.status = 'rejected';
                    withdrawal.processedAt = new Date();
                    withdrawal.processedBy = admin._id;
                    await withdrawal.save();
                }
            }

            // Refund the user for rejected withdrawals (amount is negative, so we add it back)
            const user = await User.findById(transaction.userId);
            if (user && transaction.amount < 0) { // Only refund if it was a deduction
                // Determine which balance to refund to based on balance type
                if (transaction.balanceType === 'referral') {
                    user.referralBalance = (user.referralBalance || 0) + Math.abs(transaction.amount);
                } else if (transaction.balanceType === 'task') {
                    user.taskBalance = (user.taskBalance || 0) + Math.abs(transaction.amount);
                } else if (transaction.balanceType === 'credits') {
                    user.credits = (user.credits || 0) + Math.abs(transaction.amount);
                }
                await user.save();
            }
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await transaction.save();

        return NextResponse.json({ message: `Transaction ${action}ed successfully` }, { status: 200 });

    } catch (error) {
        console.error('Admin Transaction Update API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
