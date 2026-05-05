import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
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


        const currentUser = await User.findById(decoded.userId);
        if (!currentUser || !['ADMIN', 'SUPERADMIN'].includes(currentUser.role?.toUpperCase())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }


        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query: any = {};
        if (role && role !== 'all') {
            query.role = role.toUpperCase();
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(query);
        const skip = (page - 1) * limit;
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Users API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
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


        const currentUser = await User.findById(decoded.userId);
        if (!currentUser || !['ADMIN', 'SUPERADMIN'].includes(currentUser.role?.toUpperCase())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { userId, action, role } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only SuperAdmin can modify other Admins/SuperAdmins
        if (['ADMIN', 'SUPERADMIN'].includes(targetUser.role) && currentUser.role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Forbidden: Cannot modify other admins' }, { status: 403 });
        }

        if (action === 'update_role') {
            if (currentUser.role !== 'SUPERADMIN') {
                return NextResponse.json({ error: 'Forbidden: Only SuperAdmin can change roles' }, { status: 403 });
            }
            targetUser.role = role;
        } else if (action === 'suspend') {
            targetUser.isSuspended = true;
        } else if (action === 'unsuspend') {
            targetUser.isSuspended = false;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await targetUser.save();

        return NextResponse.json({ message: 'User updated successfully', user: targetUser }, { status: 200 });

    } catch (error) {
        console.error('Admin Users API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
