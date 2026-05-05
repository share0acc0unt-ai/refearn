import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, Plan, CreditCode } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, username, whatsapp, password, referralCode, creditCode, planName, country, countryCode } = body;

        // Validation
        if (!name || !username || !whatsapp || !password || !creditCode || !planName || !country || !countryCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        // Check if whatsapp already exists
        const existingWhatsapp = await User.findOne({ whatsapp });
        if (existingWhatsapp) {
            return NextResponse.json({ error: 'WhatsApp number already registered' }, { status: 400 });
        }

        // Validate Plan
        const plan = await Plan.findOne({ name: planName, isActive: true });
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        // Validate Credit Code
        const credit = await CreditCode.findOne({ code: creditCode.toUpperCase() });
        if (!credit) {
            return NextResponse.json({ error: 'Invalid credit code' }, { status: 400 });
        }

        if (credit.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Credit code has already been used' }, { status: 400 });
        }

        // Check if credit code value is sufficient for the selected plan
        if (credit.amount < plan.price) {
            return NextResponse.json({
                error: `Credit code value (₦${credit.amount.toLocaleString()}) is insufficient for ${plan.displayName} (₦${plan.price.toLocaleString()})`
            }, { status: 400 });
        }

        // Validate Referral Code (Optional)
        let upline = null;
        if (referralCode) {
            upline = await User.findOne({ referralCode });
            if (!upline) {
                return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate own referral code
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create User
        const newUser = await User.create({
            name,
            username,
            whatsapp,
            country,
            countryCode,
            password: hashedPassword,
            referralCode: newReferralCode,
            uplinerId: upline ? upline._id : null,
            role: planName, // Set role based on plan (lite, pro, premium)
        });

        // Mark Credit Code as used
        credit.status = 'USED';
        credit.usedBy = newUser._id.toString();
        credit.usedAt = new Date();
        await credit.save();

        // Handle Guider Commission (10% of plan price)
        if (credit.guiderId) {
            const guider = await User.findById(credit.guiderId);
            if (guider && guider.role === 'guider') {
                const commission = Math.floor(plan.price * 0.10); // 10% commission
                guider.commissionBalance = (guider.commissionBalance || 0) + commission;
                await guider.save();

                // Create transaction record for guider commission
                const { Transaction } = await import('@/lib/models');
                await Transaction.create({
                    userId: guider._id,
                    type: 'signup_commission',
                    amount: commission,
                    balanceType: 'referral',
                    description: `Guider commission (10%) from ${newUser.name}'s signup`,
                    status: 'completed',
                    metadata: {
                        newUserId: newUser._id.toString(),
                        creditCode: credit.code,
                        planName: plan.name,
                    },
                });
            }
        }

        // Handle Upline Referral Commission (50% of plan price)
        if (upline) {
            const referralCommission = Math.floor(plan.price * 0.50); // 50% commission
            upline.referralBalance = (upline.referralBalance || 0) + referralCommission;
            await upline.save();

            // Create transaction record for upline commission
            const { Transaction } = await import('@/lib/models');
            await Transaction.create({
                userId: upline._id,
                type: 'referral_commission',
                amount: referralCommission,
                balanceType: 'referral',
                description: `Referral commission (50%) from ${newUser.name}'s signup`,
                status: 'completed',
                metadata: {
                    newUserId: newUser._id.toString(),
                    referralCode: upline.referralCode,
                    planName: plan.name,
                },
            });
        }

        // Generate JWT
        const token = signJwt({ userId: newUser._id, role: newUser.role });

        const response = NextResponse.json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                role: newUser.role,
                referralCode: newUser.referralCode,
            }
        }, { status: 201 });

        // Set Cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

