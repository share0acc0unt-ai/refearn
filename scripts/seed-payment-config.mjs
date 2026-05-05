import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// PaymentConfig Schema
const PaymentConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    value: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

const PaymentConfig = mongoose.models.PaymentConfig || mongoose.model('PaymentConfig', PaymentConfigSchema);

async function seedPaymentConfig() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MongoDB URI not found in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Add USDT address
        const usdtAddress = await PaymentConfig.findOneAndUpdate(
            { key: 'usdt_address' },
            {
                key: 'usdt_address',
                value: 'TJx7M2QrwLcwwZ3uBJZYgiFdqPbD5PcJym',
                description: 'USDT TRC20 wallet address for payments'
            },
            { upsert: true, new: true }
        );
        console.log('✅ USDT Address configured:', usdtAddress.value);

        // Add USDT network
        const usdtNetwork = await PaymentConfig.findOneAndUpdate(
            { key: 'usdt_network' },
            {
                key: 'usdt_network',
                value: 'TRC20',
                description: 'USDT network chain for payments'
            },
            { upsert: true, new: true }
        );
        console.log('✅ USDT Network configured:', usdtNetwork.value);

        console.log('\n✅ Payment configuration seeded successfully!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding payment config:', error);
        process.exit(1);
    }
}

seedPaymentConfig();
