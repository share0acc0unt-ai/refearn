import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, CreditCode } from '@/lib/models';

// GET - Get guiders ranked by successful transactions
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Fetch all users with guider role
        const guiders = await User.find({ role: 'guider' })
            .select('name whatsapp profilePhoto createdAt')
            .lean();

        // For each guider, count their successful transactions (used credit codes)
        const guidersWithStats = await Promise.all(
            guiders.map(async (guider) => {
                const successfulTransactions = await CreditCode.countDocuments({
                    generatedBy: guider._id,
                    status: 'USED'
                });

                // Get total value of used codes
                const usedCodes = await CreditCode.find({
                    generatedBy: guider._id,
                    status: 'USED'
                });
                const totalValue = usedCodes.reduce((sum, code) => sum + code.amount, 0);

                return {
                    _id: guider._id,
                    name: guider.name,
                    whatsapp: guider.whatsapp,
                    profilePhoto: guider.profilePhoto,
                    createdAt: guider.createdAt,
                    successfulTransactions,
                    totalValue
                };
            })
        );

        // Sort by successful transactions (descending)
        guidersWithStats.sort((a, b) => b.successfulTransactions - a.successfulTransactions);

        return NextResponse.json({
            guiders: guidersWithStats
        });

    } catch (error: any) {
        console.error('Error fetching guiders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch guiders', details: error.message },
            { status: 500 }
        );
    }
}
