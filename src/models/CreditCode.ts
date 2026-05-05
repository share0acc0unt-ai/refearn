import mongoose, { Schema, Document, Model } from 'mongoose';

export type CreditCodeStatus = 'ACTIVE' | 'USED' | 'EXPIRED';
export type CreditCodePurpose = 'signup' | 'advertisement';

export interface ICreditCode extends Document {
    code: string;
    amount: number;
    purpose?: CreditCodePurpose;
    generatedBy?: mongoose.Types.ObjectId;
    guiderId?: string;
    adNumber?: string;
    status: CreditCodeStatus;
    usedBy?: mongoose.Types.ObjectId;
    usedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CreditCodeSchema = new Schema<ICreditCode>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        purpose: {
            type: String,
            enum: ['signup', 'advertisement'],
        },
        generatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        guiderId: {
            type: String,
            ref: 'Guider',
        },
        adNumber: {
            type: String,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'USED', 'EXPIRED'],
            default: 'ACTIVE',
        },
        usedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        usedAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
CreditCodeSchema.index({ code: 1 });
CreditCodeSchema.index({ status: 1 });

const CreditCode: Model<ICreditCode> = mongoose.models.CreditCode || mongoose.model<ICreditCode>('CreditCode', CreditCodeSchema);

export default CreditCode;
