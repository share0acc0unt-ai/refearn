import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { CreditCode } from '@/lib/models';

// GET - Validate credit code
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const planPrice = searchParams.get('planPrice');

        if (!code) {
            return NextResponse.json(
                { error: 'Code parameter required' },
                { status: 400 }
            );
        }

        const creditCode = await CreditCode.findOne({ code: code.toUpperCase() });

        if (!creditCode) {
            return NextResponse.json({
                valid: false,
                message: 'Credit code not found',
            });
        }

        if (creditCode.status !== 'ACTIVE') {
            return NextResponse.json({
                valid: false,
                message: 'Credit code has already been used',
            });
        }

        // Check if credit code value is sufficient for the plan
        if (planPrice && creditCode.amount < parseInt(planPrice)) {
            return NextResponse.json({
                valid: false,
                message: `Credit code value (₦${creditCode.amount.toLocaleString()}) is insufficient for this plan (₦${parseInt(planPrice).toLocaleString()})`,
                amount: creditCode.amount,
            });
        }

        return NextResponse.json({
            valid: true,
            message: 'Credit code is valid',
            amount: creditCode.amount,
            guiderId: creditCode.guiderId,
        });

    } catch (error: any) {
        console.error('Error validating credit code:', error);
        return NextResponse.json(
            { error: 'Failed to validate credit code', details: error.message },
            { status: 500 }
        );
    }
}
