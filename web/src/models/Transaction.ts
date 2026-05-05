import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'referral_commission' | 'task_reward' | 'withdrawal' | 'credit_purchase' | 'ad_payment' | 'signup_commission' | 'ad_commission';
export type BalanceType = 'referral' | 'task' | 'credits';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: TransactionType;
    amount: number;
    balanceType: BalanceType;
    description: string;
    status: TransactionStatus;
    metadata?: {
        referralId?: string;
        taskId?: string;
        withdrawalId?: string;
        creditCodeId?: string;
        campaignId?: string;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['referral_commission', 'task_reward', 'withdrawal', 'credit_purchase', 'ad_payment', 'signup_commission', 'ad_commission'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        balanceType: {
            type: String,
            enum: ['referral', 'task', 'credits'],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed',
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ userId: 1, type: 1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
