import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, Transaction } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';

// POST - Submit credit purchase request
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

        // Check if user is a guider
        if (user.role !== 'guider') {
            return NextResponse.json({ error: 'Only guiders can purchase credits' }, { status: 403 });
        }

        const body = await request.json();
        const { amount, transactionHash } = body;

        // Validation
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!transactionHash) {
            return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 });
        }

        // Check if transaction hash already exists
        const existingTx = await Transaction.findOne({ hash: transactionHash });
        if (existingTx) {
            return NextResponse.json({ error: 'Transaction hash already submitted' }, { status: 400 });
        }

        // Create transaction record
        const transaction = await Transaction.create({
            userId: user._id,
            type: 'credit_purchase',
            amount: amount,
            balanceType: 'credits',
            description: `Credit purchase request: ₦${amount.toLocaleString()}`,
            status: 'pending',
            hash: transactionHash,
            metadata: {
                method: 'USDT',
            },
        });

        return NextResponse.json({
            message: 'Credit purchase request submitted successfully',
            transaction,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error submitting credit purchase:', error);
        return NextResponse.json(
            { error: 'Failed to submit request', details: error.message },
            { status: 500 }
        );
    }
}
