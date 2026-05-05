import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuider extends Document {
    name: string;
    phoneNumber: string;
    whatsapp: string;
    telegram?: string;
    avatar: string;
    rating: number;
    totalTransactions: number;
    responseTime: string;
    languages: string[];
    isOnline: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const GuiderSchema = new Schema<IGuider>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        whatsapp: {
            type: String,
            required: true,
            trim: true,
        },
        telegram: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            default: 5.0,
            min: 0,
            max: 5,
        },
        totalTransactions: {
            type: Number,
            default: 0,
            min: 0,
        },
        responseTime: {
            type: String,
            required: true,
        },
        languages: {
            type: [String],
            default: [],
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
GuiderSchema.index({ phoneNumber: 1 });
GuiderSchema.index({ isOnline: 1, rating: -1 });

const Guider: Model<IGuider> = mongoose.models.Guider || mongoose.model<IGuider>('Guider', GuiderSchema);

export default Guider;
