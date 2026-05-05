import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import { User } from '@/lib/models';
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Withdrawal ID is required' }, { status: 400 });
        }

        const withdrawal = await Withdrawal.findById(id).populate('userId', 'name email');

        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        return NextResponse.json({ withdrawal }, { status: 200 });

    } catch (error) {
        console.error('Admin Withdrawal Details API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
