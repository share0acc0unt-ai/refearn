import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';

// GET - Check if username or phone is available
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        const whatsapp = searchParams.get('whatsapp');

        if (!username && !whatsapp) {
            return NextResponse.json(
                { error: 'Username or whatsapp parameter required' },
                { status: 400 }
            );
        }

        const query: any = {};
        if (username) query.username = username;
        if (whatsapp) query.whatsapp = whatsapp;

        const existingUser = await User.findOne(query);

        return NextResponse.json({
            available: !existingUser,
            field: username ? 'username' : 'whatsapp',
        });

    } catch (error: any) {
        console.error('Error checking availability:', error);
        return NextResponse.json(
            { error: 'Failed to check availability', details: error.message },
            { status: 500 }
        );
    }
}
