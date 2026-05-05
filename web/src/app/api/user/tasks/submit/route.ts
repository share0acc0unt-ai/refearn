import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Task, UserTask, User } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
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

        const body = await req.json();
        const { taskId, proof, proofImage } = body;

        if (!taskId || !proof) {
            return NextResponse.json({ error: 'Task ID and proof are required' }, { status: 400 });
        }

        // Check if task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Check if task is expired
        if (task.expiryDate && new Date(task.expiryDate) < new Date()) {
            return NextResponse.json({ error: 'Task has expired' }, { status: 400 });
        }

        // Check if user already submitted this task
        const existingSubmission = await UserTask.findOne({
            userId: decoded.userId,
            taskId,
        });

        if (existingSubmission) {
            return NextResponse.json({ error: 'You have already submitted this task' }, { status: 400 });
        }

        // Create task submission
        const userTask = await UserTask.create({
            userId: decoded.userId,
            taskId,
            proof,
            proofImage,
            status: 'pending',
            submittedAt: new Date(),
        });

        return NextResponse.json({ message: 'Task submitted successfully', userTask }, { status: 201 });
    } catch (error) {
        console.error('Submit task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
