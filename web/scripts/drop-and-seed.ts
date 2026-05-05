import mongoose from 'mongoose';
import dbConnect from '../src/lib/db';
import { seedDatabase } from '../src/lib/seed';
import * as dotenv from 'dotenv';

// Load from .env.local
dotenv.config({ path: '.env.local' });

async function dropAndSeed() {
    try {
        console.log('Connecting to database...');
        await dbConnect();
        
        console.log('Dropping database...');
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
            console.log('✅ Database dropped successfully');
        } else {
            console.log('⚠️ Could not access mongoose.connection.db');
        }
        
        console.log('Starting seed process...');
        await seedDatabase();
        
        console.log('✅ All done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during drop and seed:', error);
        process.exit(1);
    }
}

dropAndSeed();
