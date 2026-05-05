require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paypulse';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    whatsapp: { type: String, unique: true, required: true },
    country: String,
    countryCode: String,
    password: { type: String, required: true },
    profilePhoto: String,
    role: {
        type: String,
        enum: ["lite", "pro", "premium", "guider", "superadmin", "admin"],
        default: "lite"
    },
    referralCode: { type: String, unique: true },
    uplinerId: mongoose.Schema.Types.ObjectId,
    referralBalance: { type: Number, default: 0 },
    taskBalance: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedRoles() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // Roles to seed
        const rolesToSeed = [
            { role: 'lite', name: 'Lite User', username: 'liteUser', whatsapp: '2348000000001', country: 'Nigeria', countryCode: '+234' },
            { role: 'pro', name: 'Pro User', username: 'proUser', whatsapp: '2348000000002', country: 'Nigeria', countryCode: '+234' },
            { role: 'premium', name: 'Premium User', username: 'premiumUser', whatsapp: '2348000000003', country: 'Nigeria', countryCode: '+234' },
            { role: 'guider', name: 'Guider User', username: 'guiderUser', whatsapp: '2348000000004', country: 'Nigeria', countryCode: '+234' },
            { role: 'admin', name: 'Admin User', username: 'adminUser', whatsapp: '2348000000005', country: 'Nigeria', countryCode: '+234' },
            { role: 'superadmin', name: 'Super Admin', username: 'superadmin', whatsapp: '2348000000000', country: 'Nigeria', countryCode: '+234' },
        ];

        for (const r of rolesToSeed) {
            const exists = await User.findOne({ role: r.role });
            if (!exists) {
                console.log(`Creating ${r.name}...`);
                const password = await bcrypt.hash(`${r.role}123`, 10);
                await User.create({
                    name: r.name,
                    username: r.username,
                    whatsapp: r.whatsapp,
                    country: r.country,
                    countryCode: r.countryCode,
                    password: password,
                    role: r.role,
                    referralCode: r.role.toUpperCase(),
                    credits: 10000, // Initial credits
                });
                console.log(`✅ ${r.name} created (User: ${r.username}, Pass: ${r.role}123)`);
            } else {
                console.log(`ℹ️ ${r.name} already exists`);
            }
        }

        console.log('Done!');
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedRoles();
