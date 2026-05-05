import dbConnect from './db';
import Guider from '@/models/Guider';
import PaymentConfig from '@/models/PaymentConfig';
import { User, Plan, CreditCode, OTPToken, Task, ExchangeRate } from '@/lib/models';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
    try {
        await dbConnect();

        // Seed Plans
        const plans = [
            {
                name: 'lite',
                displayName: 'Lite Plan',
                price: 12000,
                referralReward: 6000, // 50%
                features: ['Basic dashboard', 'Up to 50 referrals', 'Standard support'],
            },
            {
                name: 'pro',
                displayName: 'Pro Plan',
                price: 21000,
                referralReward: 10500, // 50%
                features: ['Advanced dashboard', 'Unlimited referrals', 'Marketing toolkit', 'Priority support'],
            },
            {
                name: 'premium',
                displayName: 'Premium Plan',
                price: 50000,
                referralReward: 25000, // 50%
                features: ['Premium features', 'Dedicated support', 'Exclusive webinars', 'Unlimited referrals'],
            },
        ];

        for (const plan of plans) {
            await Plan.findOneAndUpdate({ name: plan.name }, plan, { upsert: true, new: true });
        }
        console.log('✅ Plans seeded');

        // Seed SuperAdmin
        const superAdminExists = await User.findOne({ role: 'superadmin' });
        let superAdminId;
        if (!superAdminExists) {
            const hashedPassword = await bcrypt.hash('superadmin123', 10);
            const superAdmin = await User.create({
                name: 'Super Admin',
                username: 'superadmin',
                whatsapp: '0000000000',
                country: 'Nigeria',
                countryCode: '+234',
                password: hashedPassword,
                role: 'superadmin',
                referralCode: 'SUPERADMIN',
            });
            superAdminId = superAdmin._id;
            console.log('✅ SuperAdmin seeded');
        } else {
            superAdminId = superAdminExists._id;
            console.log('ℹ️ SuperAdmin already exists');
        }

        // Seed Users for other roles
        const rolesToSeed = [
            { role: 'lite', name: 'Lite User', username: 'liteUser', whatsapp: '0000000001' },
            { role: 'pro', name: 'Pro User', username: 'proUser', whatsapp: '0000000002' },
            { role: 'premium', name: 'Premium User', username: 'premiumUser', whatsapp: '0000000003' },
            { role: 'guider', name: 'Guider User', username: 'guiderUser', whatsapp: '0000000004' },
            { role: 'admin', name: 'Admin User', username: 'adminUser', whatsapp: '0000000005' },
        ];

        for (const r of rolesToSeed) {
            const exists = await User.findOne({ role: r.role });
            if (!exists) {
                const hashedPassword = await bcrypt.hash(`${r.role}123`, 10);
                await User.create({
                    name: r.name,
                    username: r.username,
                    whatsapp: r.whatsapp,
                    country: 'Nigeria',
                    countryCode: '+234',
                    password: hashedPassword,
                    role: r.role,
                    referralCode: r.role.toUpperCase(),
                });
                console.log(`✅ ${r.name} seeded`);
            } else {
                console.log(`ℹ️ ${r.name} already exists`);
            }
        }

        // Seed Exchange Rate
        const rate = await ExchangeRate.findOne();
        if (!rate) {
            await ExchangeRate.create({ nairaPerDollar: 1500 });
            console.log('✅ Exchange Rate seeded');
        } else {
            console.log('ℹ️ Exchange Rate already exists');
        }

        // Seed Tasks
        const tasksCount = await Task.countDocuments();
        if (tasksCount === 0) {
            const tasks = [
                {
                    title: 'Watch Introduction Video',
                    description: 'Watch the welcome video to understand how Paypulse works.',
                    reward: 200,
                    type: 'video',
                    platform: 'youtube',
                    link: 'https://youtube.com/watch?v=example',
                    targetTiers: ['lite', 'pro', 'premium']
                },
                {
                    title: 'Join Telegram Community',
                    description: 'Join our official Telegram channel for updates.',
                    reward: 100,
                    type: 'social',
                    platform: 'whatsapp',
                    link: 'https://t.me/paypulse',
                    targetTiers: ['lite', 'pro', 'premium']
                },
                {
                    title: 'Share on Facebook',
                    description: 'Share our latest post on your Facebook timeline.',
                    reward: 150,
                    type: 'action',
                    platform: 'facebook',
                    link: 'https://facebook.com/paypulse',
                    targetTiers: ['pro', 'premium']
                }
            ];
            await Task.insertMany(tasks);
            console.log('✅ Tasks seeded');
        } else {
            console.log('ℹ️ Tasks already exist');
        }

        // Seed Test OTP (check if exists first)
        const existingOTP = await OTPToken.findOne({ code: 'TESTOTP123' });
        if (!existingOTP) {
            await OTPToken.create({
                code: 'TESTOTP123',
                creatorId: superAdminId,
                status: 'unused'
            });
            console.log('✅ Test OTP seeded');
        } else if (existingOTP.status === 'used') {
            // Reset OTP status to unused for testing
            existingOTP.status = 'unused';
            existingOTP.usedBy = undefined;
            await existingOTP.save();
            console.log('Refreshed Test OTP');
        }

        // Seed Payment Config
        const paymentConfigs = [
            {
                key: 'usdt_wallet_address',
                value: 'TXYZabc123456789DefGhiJklMnoPqrStuVwx',
                description: 'USDT TRC20 wallet address for receiving payments',
            },
            {
                key: 'usdt_network',
                value: 'TRC20',
                description: 'USDT network chain (TRC20 on TRON blockchain)',
            },
        ];

        for (const config of paymentConfigs) {
            await PaymentConfig.findOneAndUpdate(
                { key: config.key },
                config,
                { upsert: true, new: true }
            );
        }
        console.log('✅ Payment configs seeded');

        // Seed Guiders
        const guidersData = [
            {
                name: 'Sarah Johnson',
                phoneNumber: '+1234567890',
                whatsapp: '+1234567890',
                telegram: '@sarahjohnson',
                avatar: 'https://i.pravatar.cc/150?img=1',
                rating: 4.9,
                totalTransactions: 156,
                responseTime: '< 5 min',
                languages: ['English', 'Spanish'],
                isOnline: true,
                isVerified: true,
            },
            {
                name: 'Michael Chen',
                phoneNumber: '+1234567891',
                whatsapp: '+1234567891',
                telegram: '@michaelchen',
                avatar: 'https://i.pravatar.cc/150?img=12',
                rating: 4.8,
                totalTransactions: 203,
                responseTime: '< 10 min',
                languages: ['English', 'Mandarin'],
                isOnline: false,
                isVerified: true,
            },
            {
                name: 'Emma Williams',
                phoneNumber: '+1234567892',
                whatsapp: '+1234567892',
                telegram: '@emmawilliams',
                avatar: 'https://i.pravatar.cc/150?img=5',
                rating: 5.0,
                totalTransactions: 89,
                responseTime: '< 3 min',
                languages: ['English', 'French'],
                isOnline: true,
                isVerified: true,
            },
            {
                name: 'David Martinez',
                phoneNumber: '+1234567893',
                whatsapp: '+1234567893',
                telegram: null,
                avatar: 'https://i.pravatar.cc/150?img=13',
                rating: 4.7,
                totalTransactions: 134,
                responseTime: '< 15 min',
                languages: ['English', 'Spanish', 'Portuguese'],
                isOnline: true,
                isVerified: true,
            },
            {
                name: 'Lisa Anderson',
                phoneNumber: '+1234567894',
                whatsapp: '+1234567894',
                telegram: '@lisaanderson',
                avatar: 'https://i.pravatar.cc/150?img=9',
                rating: 4.9,
                totalTransactions: 178,
                responseTime: '< 5 min',
                languages: ['English'],
                isOnline: false,
                isVerified: true,
            },
            {
                name: 'James Taylor',
                phoneNumber: '+1234567895',
                whatsapp: '+1234567895',
                telegram: '@jamestaylor',
                avatar: 'https://i.pravatar.cc/150?img=14',
                rating: 4.6,
                totalTransactions: 92,
                responseTime: '< 20 min',
                languages: ['English', 'German'],
                isOnline: true,
                isVerified: true,
            },
        ];

        for (const guiderData of guidersData) {
            await Guider.findOneAndUpdate(
                { phoneNumber: guiderData.phoneNumber },
                guiderData,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Guiders seeded');

        // Seed Credit Codes
        const existingCodes = await CreditCode.countDocuments();
        if (existingCodes < 10) {
            const codesToCreate = 10 - existingCodes;
            const creditCodes = [];

            for (let i = 0; i < codesToCreate; i++) {
                creditCodes.push({
                    code: `CREDIT-${randomBytes(4).toString('hex').toUpperCase()}`,
                    amount: 50000 + i * 10000,
                    status: 'ACTIVE' as const,
                });
            }

            await CreditCode.insertMany(creditCodes);
            console.log(`✅ ${codesToCreate} credit codes seeded`);
        } else {
            console.log('✅ Credit codes already exist');
        }

        return {
            success: true,
            message: 'Database seeded successfully',
        };
    } catch (error: any) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}
