import mongoose, { Schema, Document, Model } from 'mongoose';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type WithdrawalMethod = 'bank_transfer' | 'crypto';

export interface IWithdrawal extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    method: WithdrawalMethod;
    accountDetails: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        walletAddress?: string;
        network?: string;
    };
    status: WithdrawalStatus;
    requestedAt: Date;
    processedAt?: Date;
    processedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        method: {
            type: String,
            enum: ['bank_transfer', 'crypto'],
            required: true,
        },
        accountDetails: {
            type: {
                accountName: String,
                accountNumber: String,
                bankName: String,
                walletAddress: String,
                network: String,
            },
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending',
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
        },
        processedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        rejectionReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
WithdrawalSchema.index({ userId: 1, status: 1 });
WithdrawalSchema.index({ status: 1, createdAt: -1 });

const Withdrawal: Model<IWithdrawal> = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);

export default Withdrawal;
