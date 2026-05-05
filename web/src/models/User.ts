import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name?: string;
    phone?: string;
    country?: string;
    countryCode?: string;
    password?: string;
    credits: number;
    role: 'USER' | 'GUIDER' | 'ADMIN' | 'SUPERADMIN';
    status: 'active' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        countryCode: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
        },
        credits: {
            type: Number,
            default: 0,
            min: 0,
        },
        role: {
            type: String,
            enum: ['USER', 'GUIDER', 'ADMIN', 'SUPERADMIN'],
            default: 'USER',
        },
        status: {
            type: String,
            enum: ['active', 'suspended'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster email lookups
UserSchema.index({ email: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
