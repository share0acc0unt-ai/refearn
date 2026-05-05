import dbConnect from '../src/lib/db';
import { User } from '../src/lib/models';
import bcrypt from 'bcryptjs';

async function createGuider() {
    try {
        await dbConnect();

        // Check if guider already exists
        const existingGuider = await User.findOne({ username: 'guider1' });
        if (existingGuider) {
            console.log('❌ Guider user already exists');
            console.log('Username:', existingGuider.username);
            console.log('WhatsApp:', existingGuider.whatsapp);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('guider123', 10);

        // Generate referral code
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create guider user
        const guider = await User.create({
            name: 'Guider Account',
            username: 'guider1',
            whatsapp: '+2349012345678',
            password: hashedPassword,
            role: 'guider',
            referralCode: referralCode,
            credits: 100000,
            referralBalance: 0,
            taskBalance: 0,
        });

        console.log('✅ Guider user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Username:', guider.username);
        console.log('Password:', 'guider123');
        console.log('WhatsApp:', guider.whatsapp);
        console.log('Role:', guider.role);
        console.log('Credits:', guider.credits.toLocaleString());
        console.log('Referral Code:', guider.referralCode);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating guider:', error);
        process.exit(1);
    }
}

createGuider();

