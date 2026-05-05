import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentConfig extends Document {
    key: string;
    value: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentConfigSchema = new Schema<IPaymentConfig>(
    {
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
    },
    {
        timestamps: true,
    }
);

// Index for faster key lookups
PaymentConfigSchema.index({ key: 1 });

const PaymentConfig: Model<IPaymentConfig> = mongoose.models.PaymentConfig || mongoose.model<IPaymentConfig>('PaymentConfig', PaymentConfigSchema);

export default PaymentConfig;
