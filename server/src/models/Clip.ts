import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IComment {
    user: Types.ObjectId;
    text: string;
    createdAt: Date;
}

export interface IClip extends Document {
    title: string;
    url: string;
    user: Types.ObjectId;
    likes: number;
    comments: IComment[];
    createdAt: Date;
}

const ClipSchema: Schema<IClip> = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    url: {
        type: String,
        required: [true, 'Please add a URL'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Clip: Model<IClip> = mongoose.model<IClip>('Clip', ClipSchema);
export default Clip;
