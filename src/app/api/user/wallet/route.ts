import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import Withdrawal from '@/models/Withdrawal';
import Transaction from '@/models/Transaction';
import { verifyJwt } from '@/lib/auth';

// GET - Fetch user wallet balances
export async function GET(request: NextRequest) {
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

        // Get pending withdrawals (only show those created within last 10 minutes)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const pendingWithdrawals = await Withdrawal.find({
            userId: user._id,
            status: 'pending',
            requestedAt: { $gte: tenMinutesAgo }
        });

        const totalPendingWithdrawal = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

        // Calculate Total Made (All earnings - never gets deducted)
        // Include: referral commissions, signup commissions, ad commissions, and task rewards
        const totalMadeResult = await Transaction.aggregate([
            {
                $match: {
                    userId: user._id,
                    type: { $in: ['referral_commission', 'signup_commission', 'ad_commission', 'task_reward'] },
                    amount: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const totalMade = totalMadeResult[0]?.total || 0;

        // Calculate Total Withdrawn (Sum of all APPROVED withdrawals - not just completed)
        const totalWithdrawnResult = await Withdrawal.aggregate([
            {
                $match: {
                    userId: user._id,
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const totalWithdrawn = totalWithdrawnResult[0]?.total || 0;

        return NextResponse.json({
            balances: {
                referralBalance: user.referralBalance || 0,
                taskBalance: user.taskBalance || 0,
                credits: user.credits || 0,
                commissionBalance: user.commissionBalance || 0, // For guiders - tracked during signup
                totalBalance: (user.referralBalance || 0) + (user.taskBalance || 0),
                totalMade,
                totalWithdrawn
            },
            pendingWithdrawal: totalPendingWithdrawal,
            withdrawalCount: pendingWithdrawals.length,
        });

    } catch (error: any) {
        console.error('Error fetching wallet:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet data', details: error.message },
            { status: 500 }
        );
    }
}

// POST - Request withdrawal
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

        const body = await request.json();
        const { amount, method, accountDetails, balanceType } = body;

        // Validation
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!method || !['bank_transfer', 'crypto'].includes(method)) {
            return NextResponse.json({ error: 'Invalid withdrawal method' }, { status: 400 });
        }

        if (!accountDetails) {
            return NextResponse.json({ error: 'Account details required' }, { status: 400 });
        }

        if (!balanceType || !['referral', 'task'].includes(balanceType)) {
            return NextResponse.json({ error: 'Invalid balance type' }, { status: 400 });
        }

        // Check if user has sufficient balance in the selected account
        const availableBalance = balanceType === 'referral'
            ? (user.referralBalance || 0)
            : (user.taskBalance || 0);

        if (availableBalance < amount) {
            return NextResponse.json({
                error: `Insufficient ${balanceType} balance. Available: ₦${availableBalance.toLocaleString()}`
            }, { status: 400 });
        }

        // Minimum withdrawal amount
        const minWithdrawal = 5000;
        if (amount < minWithdrawal) {
            return NextResponse.json({
                error: `Minimum withdrawal amount is ₦${minWithdrawal.toLocaleString()}`
            }, { status: 400 });
        }

        // Deduct balance
        if (balanceType === 'referral') {
            user.referralBalance = (user.referralBalance || 0) - amount;
        } else {
            user.taskBalance = (user.taskBalance || 0) - amount;
        }
        await user.save();

        // Create withdrawal request
        const withdrawal = await Withdrawal.create({
            userId: user._id,
            amount,
            method,
            accountDetails,
            status: 'pending',
            requestedAt: new Date(),
        });

        // Create transaction record
        await Transaction.create({
            userId: user._id,
            type: 'withdrawal',
            amount: -amount,
            balanceType: balanceType, // Use the selected balance type
            description: `Withdrawal request - ${method}`,
            status: 'pending',
            metadata: {
                withdrawalId: withdrawal._id.toString(),
            },
        });

        return NextResponse.json({
            message: 'Withdrawal request submitted successfully',
            withdrawal: {
                _id: withdrawal._id,
                amount: withdrawal.amount,
                method: withdrawal.method,
                status: withdrawal.status,
                requestedAt: withdrawal.requestedAt,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating withdrawal:', error);
        return NextResponse.json(
            { error: 'Failed to create withdrawal request', details: error.message },
            { status: 500 }
        );
    }
}
