import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, UserTask, Transaction } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
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
        const { userTaskId, action } = body; // action: 'approve' | 'reject'

        if (!userTaskId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userTask = await UserTask.findById(userTaskId).populate('taskId');
        if (!userTask) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        if (!userTask.taskId) {
            return NextResponse.json({ error: 'Task details not found' }, { status: 404 });
        }

        if (userTask.status !== 'pending') {
            return NextResponse.json({ error: 'Task already processed' }, { status: 400 });
        }

        if (action === 'approve') {
            userTask.status = 'approved';
            userTask.approvedAt = new Date();

            // Credit the user's task balance
            const user = await User.findById(userTask.userId);
            if (user && userTask.taskId.reward) {
                user.taskBalance = (user.taskBalance || 0) + userTask.taskId.reward;
                await user.save();

                await Transaction.create({
                    userId: user._id,
                    type: 'task_reward',
                    amount: userTask.taskId.reward,
                    balanceType: 'task',
                    description: `Reward for task: ${userTask.taskId.title}`,
                    status: 'completed'
                });
            }
        } else if (action === 'reject') {
            userTask.status = 'rejected';
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await userTask.save();

        return NextResponse.json({ message: `Task ${action}ed successfully` }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Task Approval API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}
