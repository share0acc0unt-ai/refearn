import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
    try {
        const result = await seedDatabase();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
    }
}
