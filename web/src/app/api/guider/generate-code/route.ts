import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, CreditCode, Transaction } from '@/lib/models';
import { verifyJwt } from '@/lib/auth';

// POST - Generate credit code
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from token
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyJwt(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user is a guider
        if (user.role !== 'guider') {
            return NextResponse.json({ error: 'Only guiders can generate credit codes' }, { status: 403 });
        }

        const body = await request.json();
        const { amount, purpose } = body;

        // Validation
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!purpose || !['signup', 'advertisement'].includes(purpose)) {
            return NextResponse.json({ error: 'Purpose must be either "signup" or "advertisement"' }, { status: 400 });
        }

        // Check if guider has sufficient credits
        const guiderCredits = user.credits || 0;
        if (guiderCredits < amount) {
            return NextResponse.json({
                error: `Insufficient credits. Available: ₦${guiderCredits.toLocaleString()}, Required: ₦${amount.toLocaleString()}`
            }, { status: 400 });
        }

        // Generate unique code
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        let code = generateCode();
        let attempts = 0;
        const maxAttempts = 10;

        // Ensure code is unique
        while (attempts < maxAttempts) {
            const existing = await CreditCode.findOne({ code });
            if (!existing) break;
            code = generateCode();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            return NextResponse.json({ error: 'Failed to generate unique code. Please try again.' }, { status: 500 });
        }

        // Set expiry date to 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Create credit code
        const creditCode = await CreditCode.create({
            code,
            amount,
            value: amount, // Backward compatibility
            generatedBy: user._id,
            creatorId: user._id, // Backward compatibility
            purpose,
            status: 'ACTIVE',
            expiresAt: expiryDate,
        });

        // Deduct amount from guider's credits
        user.credits = guiderCredits - amount;
        await user.save();

        // Create transaction record
        await Transaction.create({
            userId: user._id,
            type: 'credit_purchase',
            amount: -amount,
            balanceType: 'credits',
            description: `Generated ${purpose} credit code: ${code}`,
            status: 'completed',
            metadata: {
                creditCodeId: creditCode._id.toString(),
                purpose,
            },
        });

        return NextResponse.json({
            message: 'Credit code generated successfully',
            creditCode: {
                _id: creditCode._id,
                code: creditCode.code,
                amount: creditCode.amount,
                purpose: creditCode.purpose,
                status: creditCode.status,
                expiresAt: creditCode.expiresAt,
            },
            remainingCredits: user.credits,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error generating credit code:', error);
        return NextResponse.json(
            { error: 'Failed to generate credit code', details: error.message },
            { status: 500 }
        );
    }
}
