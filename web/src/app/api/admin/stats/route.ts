import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, Task, Transaction } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

        // Count all users excluding admins/superadmins
        const totalUsers = await User.countDocuments({
            role: { $in: ['lite', 'pro', 'premium', 'guider'] }
        });

        // Count active users (not suspended)
        const activeUsers = await User.countDocuments({
            role: { $in: ['lite', 'pro', 'premium', 'guider'] },
            isSuspended: false
        });

        const totalTasks = await Task.countDocuments({});
        const totalTransactions = await Transaction.countDocuments({});

        // Calculate total revenue or payouts if needed
        // For now, simple counts

        return NextResponse.json({
            stats: {
                totalUsers,
                activeUsers,
                totalTasks,
                totalTransactions
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Stats API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
