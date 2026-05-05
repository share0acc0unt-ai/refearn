import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentMethod = 'USDT' | 'CREDIT_CODE';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IPayment extends Document {
    campaignId: string;
    userId?: string;
    method: PaymentMethod;
    amount: number;
    txHash?: string;
    creditCode?: string;
    guiderId?: string;
    status: PaymentStatus;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        campaignId: {
            type: String,
            required: true,
            ref: 'Campaign',
        },
        userId: {
            type: String,
            ref: 'User',
        },
        method: {
            type: String,
            required: true,
            enum: ['USDT', 'CREDIT_CODE'],
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        txHash: {
            type: String,
            trim: true,
        },
        creditCode: {
            type: String,
            trim: true,
        },
        guiderId: {
            type: String,
            ref: 'Guider',
        },
        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'REJECTED'],
            default: 'PENDING',
        },
        verifiedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
PaymentSchema.index({ campaignId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
