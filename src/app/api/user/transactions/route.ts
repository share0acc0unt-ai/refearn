import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import { verifyJwt } from '@/lib/auth';

// GET - Fetch user transaction history
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

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');

        // Build query
        const query: any = { userId: decoded.userId };
        if (type) query.type = type;
        if (status) query.status = status;

        // Fetch transactions with pagination
        const skip = (page - 1) * limit;
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Transaction.countDocuments(query);

        // Calculate summary
        const summary = await Transaction.aggregate([
            { $match: { userId: decoded.userId, status: 'completed' } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        return NextResponse.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            summary,
        });

    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions', details: error.message },
            { status: 500 }
        );
    }
}
