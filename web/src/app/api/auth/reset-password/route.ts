import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

// Password reset API endpoint
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { username, whatsapp, newPassword, step } = body;

        // Step 1: Verify username and phone number
        if (step === 'verify') {
            if (!username || !whatsapp) {
                return NextResponse.json(
                    { error: 'Username and phone number are required' },
                    { status: 400 }
                );
            }

            // Try to find user with exact WhatsApp first
            let user = await User.findOne({ username, whatsapp });

            // If not found, try with country code prefix (234 for Nigeria)
            if (!user && !whatsapp.startsWith('234')) {
                const whatsappWithCode = '234' + whatsapp.replace(/^0/, '');  // Remove only first zero
                user = await User.findOne({ username, whatsapp: whatsappWithCode });
            }

            // If still not found, try removing country code if present
            if (!user && whatsapp.startsWith('234')) {
                const whatsappWithoutCode = '0' + whatsapp.substring(3);
                user = await User.findOne({ username, whatsapp: whatsappWithoutCode });
            }

            if (!user) {
                return NextResponse.json(
                    { error: 'No account found with these credentials' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: 'Credentials verified successfully',
                verified: true,
            }, { status: 200 });
        }

        // Step 2: Reset password
        if (step === 'reset') {
            if (!username || !whatsapp || !newPassword) {
                return NextResponse.json(
                    { error: 'All fields are required' },
                    { status: 400 }
                );
            }

            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: 'Password must be at least 6 characters long' },
                    { status: 400 }
                );
            }

            // Try to find user with exact WhatsApp first
            let user = await User.findOne({ username, whatsapp });

            // If not found, try with country code prefix (234 for Nigeria)
            if (!user && !whatsapp.startsWith('234')) {
                const whatsappWithCode = '234' + whatsapp.replace(/^0/, '');  // Remove only first zero
                user = await User.findOne({ username, whatsapp: whatsappWithCode });
            }

            // If still not found, try removing country code if present
            if (!user && whatsapp.startsWith('234')) {
                const whatsappWithoutCode = '0' + whatsapp.substring(3);
                user = await User.findOne({ username, whatsapp: whatsappWithoutCode });
            }

            if (!user) {
                return NextResponse.json(
                    { error: 'No account found with these credentials' },
                    { status: 404 }
                );
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password
            user.password = hashedPassword;
            await user.save();

            return NextResponse.json({
                message: 'Password reset successfully',
                success: true,
            }, { status: 200 });
        }

        return NextResponse.json(
            { error: 'Invalid step parameter' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
