const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

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
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
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
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding payment config:', error);
        process.exit(1);
    }
}

seedPaymentConfig();
