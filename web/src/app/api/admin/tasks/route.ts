import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Task, User } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to check admin access
async function checkAdminAccess() {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) return null;

    const user = await User.findById(decoded.userId);
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role?.toUpperCase())) return null;

    return user;
}

export async function GET(req: Request) {
    try {
        const admin = await checkAdminAccess();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tasks = await Task.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        console.error('Admin Tasks API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const admin = await checkAdminAccess();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { title, description, reward, type, link, expiryDate } = body;

        if (!title || !description || !reward || !type || !expiryDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newTask = await Task.create({
            title,
            description,
            reward,
            type,
            link,
            expiryDate,
            createdBy: admin._id
        });

        return NextResponse.json({ message: 'Task created successfully', task: newTask }, { status: 201 });
    } catch (error) {
        console.error('Admin Create Task API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const admin = await checkAdminAccess();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { taskId, ...updates } = body;

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });
        if (!updatedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task updated successfully', task: updatedTask }, { status: 200 });
    } catch (error) {
        console.error('Admin Update Task API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await checkAdminAccess();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get('id');

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Admin Delete Task API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
