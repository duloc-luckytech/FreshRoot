import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDeal extends Document {
    title: string;
    shopName: string;
    description?: string;
    tag: 'Ưu đãi' | 'Mua chung' | 'Voucher';
    location: {
        type: 'Point';
        coordinates: [number, number];
        formattedAddress?: string;
    };
    discountPercentage?: number;
    expiresAt?: Date;
    createdAt: Date;
}

const DealSchema: Schema<IDeal> = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    shopName: {
        type: String,
        required: [true, 'Please add shop name'],
    },
    description: {
        type: String,
    },
    tag: {
        type: String,
        enum: ['Ưu đãi', 'Mua chung', 'Voucher'],
        default: 'Ưu đãi',
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        formattedAddress: String,
    },
    discountPercentage: {
        type: Number,
    },
    expiresAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

DealSchema.index({ location: '2dsphere' });

const Deal: Model<IDeal> = mongoose.model<IDeal>('Deal', DealSchema);
export default Deal;
