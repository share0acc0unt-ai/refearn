import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    reach: number;
    engagement: number;
    updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
    {
        campaignId: {
            type: String,
            required: true,
            unique: true,
            ref: 'Campaign',
        },
        impressions: {
            type: Number,
            default: 0,
            min: 0,
        },
        clicks: {
            type: Number,
            default: 0,
            min: 0,
        },
        conversions: {
            type: Number,
            default: 0,
            min: 0,
        },
        reach: {
            type: Number,
            default: 0,
            min: 0,
        },
        engagement: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: { createdAt: false, updatedAt: true },
    }
);

// Index for faster campaign lookups
AnalyticsSchema.index({ campaignId: 1 });

const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
