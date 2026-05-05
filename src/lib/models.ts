import mongoose, { Schema, model, models } from 'mongoose';

// User Schema
const UserSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    whatsapp: { type: String, unique: true, required: true },
    country: { type: String },
    countryCode: { type: String },
    password: { type: String, required: true },
    profilePhoto: { type: String },
    role: {
        type: String,
        enum: ["lite", "pro", "premium", "guider", "superadmin", "admin"],
        default: "lite"
    },
    referralCode: { type: String, unique: true },
    uplinerId: { type: Schema.Types.ObjectId, ref: 'User' },
    referralBalance: { type: Number, default: 0 },
    taskBalance: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 }, // For guiders' commission earnings
    isSuspended: { type: Boolean, default: false },
}, { timestamps: true });

// OTP Token Schema
const OTPTokenSchema = new Schema({
    code: { type: String, unique: true, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ["unused", "used"], default: "unused" },
    usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Credit Code Schema
const CreditCodeSchema = new Schema({
    code: { type: String, unique: true, required: true, uppercase: true },
    amount: { type: Number, required: true },
    value: { type: Number }, // Keep for backward compatibility
    purpose: { type: String, enum: ['signup', 'advertisement'] },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Alias for generatedBy
    creatorId: { type: Schema.Types.ObjectId, ref: 'User' }, // Keep for backward compatibility
    guiderId: { type: String, ref: 'Guider' },
    adNumber: { type: String },
    status: { type: String, enum: ['ACTIVE', 'USED', 'EXPIRED', 'unused', 'used'], default: 'ACTIVE' },
    usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    usedFor: { type: String },
    usedAt: { type: Date },
    expiresAt: { type: Date },
}, { timestamps: true });

// Transaction Schema
const TransactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: [
            "credit_purchase", "withdrawal", "referral_commission", "task_reward",
            "ad_payment", "signup_commission", "ad_commission"
        ],
        required: true
    },
    balanceType: { type: String, enum: ['referral', 'task', 'credits'], default: 'credits' },
    description: { type: String },
    hash: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected", "completed", "failed"], default: "pending" },
    metadata: { type: Map, of: String },
}, { timestamps: true });

// Force model refresh in dev
if (process.env.NODE_ENV === 'development') {
    if (models.Transaction) delete models.Transaction;
    if (models.TransactionV2) delete models.TransactionV2;
}
export const Transaction = models.TransactionV2 || model('TransactionV2', TransactionSchema, 'transactions');

// Task Schema
const TaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    reward: { type: Number, required: true },
    type: { type: String, enum: ["video", "social", "action"], required: true },
    platform: { type: String, enum: ["whatsapp", "facebook", "twitter", "tiktok", "instagram", "youtube", "all"], default: "all" },
    link: { type: String },
    image: { type: String },
    targetTiers: { type: [String], default: ["lite", "pro", "premium"] },
    expiryDate: { type: Date },
}, { timestamps: true });

// UserTask Schema
const UserTaskSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    proof: { type: String },
    proofImage: { type: String }, // Cloudinary URL for uploaded proof image/video
    submittedAt: { type: Date },
});

// Plan Schema
const PlanSchema = new Schema({
    name: { type: String, unique: true, required: true },
    displayName: { type: String, required: true },
    price: { type: Number, required: true },
    referralReward: { type: Number, required: true },
    features: { type: [String] },
    durationDays: { type: Number, default: 30 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// AdCampaign Schema
const AdCampaignSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    contactInfo: { type: String },
    platform: { type: String, required: true },
    actionType: { type: String, required: true },
    link: { type: String, required: true },
    image: { type: String },
    targetCount: { type: Number, required: true },
    costPerAction: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    creditCode: { type: String, required: true },
    status: { type: String, enum: ["pending", "active", "completed", "rejected"], default: "pending" },
}, { timestamps: true });

// Exchange Rate Schema
const ExchangeRateSchema = new Schema({
    nairaPerDollar: { type: Number, required: true, default: 1000 },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);
export const OTPToken = models.OTPToken || model('OTPToken', OTPTokenSchema);

// Force model refresh in dev to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    if (models.CreditCode) delete models.CreditCode;
    if (models.CreditCodeV2) delete models.CreditCodeV2;
}
// Use a new model name to bypass cache, but map to the same collection 'creditcodes'
export const CreditCode = models.CreditCodeV2 || model('CreditCodeV2', CreditCodeSchema, 'creditcodes');
// Transaction is already exported above
export const Task = models.Task || model('Task', TaskSchema);
export const UserTask = models.UserTask || model('UserTask', UserTaskSchema);
export const Plan = models.Plan || model('Plan', PlanSchema);
export const AdCampaign = models.AdCampaign || model('AdCampaign', AdCampaignSchema);
export const ExchangeRate = models.ExchangeRate || model('ExchangeRate', ExchangeRateSchema);
