import mongoose, { Schema, Document, Model } from 'mongoose';

export type CampaignAction = 'VISIT' | 'FOLLOW' | 'LIKE' | 'WATCH' | 'COMMENT' | 'MAKE_PROMOTIONAL_VIDEO';
export type CampaignStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface ICampaign extends Document {
    adNumber: string;
    title: string;
    description: string;
    targetUrl?: string;
    action: CampaignAction;
    targetedReach: number;
    duration: number;
    whatsappNumber: string;
    billAmount: number;
    status: CampaignStatus;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
    {
        adNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        targetUrl: {
            type: String,
            trim: true,
        },
        action: {
            type: String,
            required: true,
            enum: ['VISIT', 'FOLLOW', 'LIKE', 'WATCH', 'COMMENT', 'MAKE_PROMOTIONAL_VIDEO'],
        },
        targetedReach: {
            type: Number,
            required: true,
            min: 1,
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
        },
        whatsappNumber: {
            type: String,
            required: true,
            trim: true,
        },
        billAmount: {
            type: Number,
            required: true,
            min: 10,
        },
        status: {
            type: String,
            enum: ['PENDING_PAYMENT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
            default: 'PENDING_PAYMENT',
        },
        userId: {
            type: String,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
CampaignSchema.index({ adNumber: 1 });
CampaignSchema.index({ userId: 1 });
CampaignSchema.index({ status: 1 });

const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
