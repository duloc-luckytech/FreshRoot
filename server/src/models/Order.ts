import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    recipeId: mongoose.Types.ObjectId;
    title: string;
    quantity: number;
    price: number;
    image: string;
}

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    shopId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
    paymentMethod: 'momo' | 'cod';
    paymentStatus: 'pending' | 'success' | 'failed';
    momoRequestId?: string;
    momoOrderId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema({
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    image: { type: String, required: true },
});

const OrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'shipping', 'completed', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['momo', 'cod'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
    },
    momoRequestId: { type: String },
    momoOrderId: { type: String },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
