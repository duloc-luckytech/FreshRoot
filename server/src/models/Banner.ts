import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
    title: string;
    image: string;
    link?: string;
    active: boolean;
    createdAt: Date;
}

const BannerSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
    },
    link: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IBanner>('Banner', BannerSchema);
