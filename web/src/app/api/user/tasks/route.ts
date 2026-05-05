import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Task, UserTask } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
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

        // Get available tasks for the user's tier
        const tasks = await Task.find({
            expiryDate: { $gt: new Date() }, // Not expired
        }).sort({ createdAt: -1 });

        // Get user's submitted tasks
        const userTasks = await UserTask.find({ userId: decoded.userId })
            .populate('taskId')
            .sort({ submittedAt: -1 });

        return NextResponse.json({
            tasks,
            userTasks,
        });
    } catch (error) {
        console.error('Tasks API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
