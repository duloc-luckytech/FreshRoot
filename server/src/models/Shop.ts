import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
    name: string;
    image: string;
    address: string;
    location: {
        type: string;
        coordinates: number[];
    };
    rating: number;
    isVerified: boolean;
    discountLabel?: string;
    isFeatured: boolean;
    categories: string[];
    ownerId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ShopSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
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
    },
    rating: {
        type: Number,
        default: 0,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    discountLabel: {
        type: String,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    categories: {
        type: [String],
        default: [],
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

ShopSchema.index({ location: '2dsphere' });

const Shop = mongoose.model<IShop>('Shop', ShopSchema);
export default Shop;
