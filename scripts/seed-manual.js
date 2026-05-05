require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// ---- SCHEMAS (Simplified for script usage) ----
// Copied and adapted from src/lib/models.ts

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    whatsapp: { type: String, unique: true, required: true },
    country: String,
    countryCode: String,
    password: { type: String, required: true },
    role: { type: String, default: "lite" },
    referralCode: { type: String, unique: true },
    credits: { type: Number, default: 0 },
}, { timestamps: true });

const PlanSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    displayName: { type: String, required: true },
    price: { type: Number, required: true },
    referralReward: { type: Number, required: true },
    features: { type: [String] },
    durationDays: { type: Number, default: 30 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    reward: { type: Number, required: true },
    type: { type: String, enum: ["video", "social", "action"], required: true },
    platform: { type: String, default: "all" },
    link: { type: String },
    image: { type: String },
    targetTiers: { type: [String], default: ["lite", "pro", "premium"] },
    expiryDate: { type: Date },
}, { timestamps: true });

const ExchangeRateSchema = new mongoose.Schema({
    nairaPerDollar: { type: Number, required: true, default: 1000 },
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const PaymentConfigSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    value: { type: String, required: true },
    description: String,
}, { timestamps: true });

const GuiderSchema = new mongoose.Schema({
    name: String,
    phoneNumber: { type: String, unique: true },
    whatsapp: String,
    telegram: String,
    avatar: String,
    rating: Number,
    totalTransactions: Number,
    responseTime: String,
    languages: [String],
    isOnline: Boolean,
    isVerified: Boolean,
});

const CreditCodeSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true, uppercase: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'ACTIVE' },
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const ExchangeRate = mongoose.models.ExchangeRate || mongoose.model('ExchangeRate', ExchangeRateSchema);
const PaymentConfig = mongoose.models.PaymentConfig || mongoose.model('PaymentConfig', PaymentConfigSchema);
const Guider = mongoose.models.Guider || mongoose.model('Guider', GuiderSchema);
const CreditCode = mongoose.models.CreditCodeV2 || mongoose.model('CreditCodeV2', CreditCodeSchema, 'creditcodes');


async function seedAll() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // 1. Seed Plans
        const plans = [
            { name: 'lite', displayName: 'Lite Plan', price: 12000, referralReward: 6000, features: ['Basic dashboard', 'Up to 50 referrals'] },
            { name: 'pro', displayName: 'Pro Plan', price: 21000, referralReward: 10500, features: ['Advanced dashboard', 'Unlimited referrals'] },
            { name: 'premium', displayName: 'Premium Plan', price: 50000, referralReward: 25000, features: ['Premium features', 'Exclusive webinars'] },
        ];
        for (const plan of plans) {
            await Plan.findOneAndUpdate({ name: plan.name }, plan, { upsert: true, new: true });
        }
        console.log('✅ Plans seeded');

        // 2. Seed Exchange Rate
        const rate = await ExchangeRate.findOne();
        if (!rate) {
            await ExchangeRate.create({ nairaPerDollar: 1500 }); // Example rate
            console.log('✅ Exchange Rate seeded');
        } else {
            console.log('ℹ️ Exchange Rate already exists');
        }

        // 3. Seed Tasks (Examples)
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

        // 4. Seed Payment Config
        const paymentConfigs = [
            { key: 'usdt_wallet_address', value: 'TXYZabc123456789DefGhiJklMnoPqrStuVwx', description: 'USDT TRC20 wallet' },
            { key: 'usdt_network', value: 'TRC20', description: 'USDT network' },
        ];
        for (const config of paymentConfigs) {
            await PaymentConfig.findOneAndUpdate({ key: config.key }, config, { upsert: true, new: true });
        }
        console.log('✅ Payment Config seeded');

        // 5. Seed Guiders
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
            }
        ];
        for (const guiderData of guidersData) {
            await Guider.findOneAndUpdate({ phoneNumber: guiderData.phoneNumber }, guiderData, { upsert: true, new: true });
        }
        console.log('✅ Guiders seeded');

        console.log('Done!');
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding all:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedAll();
