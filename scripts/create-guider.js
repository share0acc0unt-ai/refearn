require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true },
    whatsapp: { type: String, unique: true },
    password: String,
    profilePhoto: String,
    role: String,
    referralCode: { type: String, unique: true },
    uplinerId: mongoose.Schema.Types.ObjectId,
    referralBalance: { type: Number, default: 0 },
    taskBalance: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createGuider() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if guider already exists
        const existingGuider = await User.findOne({ username: 'guider1' });
        if (existingGuider) {
            console.log('❌ Guider user already exists');
            console.log('Username:', existingGuider.username);
            console.log('WhatsApp:', existingGuider.whatsapp);
            await mongoose.connection.close();
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

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating guider:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

createGuider();
