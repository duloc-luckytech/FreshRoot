import mongoose, { Document, Schema } from 'mongoose';

export interface IVoucher extends Document {
    code: string;
    discountAmount: number;
    discountType: 'flat' | 'percentage';
    minOrderAmount: number;
    shopId: mongoose.Types.ObjectId;
    expiryDate: Date;
    isActive: boolean;
    createdAt: Date;
}

const VoucherSchema: Schema = new Schema({
    code: {
        type: String,
        required: [true, 'Please add a code'],
        unique: true,
        uppercase: true,
    },
    discountAmount: {
        type: Number,
        required: [true, 'Please add a discount amount'],
    },
    discountType: {
        type: String,
        enum: ['flat', 'percentage'],
        default: 'flat',
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please add an expiry date'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Voucher = mongoose.model<IVoucher>('Voucher', VoucherSchema);
export default Voucher;
