import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    description: string;
    content: string; // Detailed content/HTML/Markdown
    image: string;
    category: 'Cooking Guide' | 'Ingredient Screening' | 'Risk Warning';
    author: mongoose.Types.ObjectId;
    riskAlerts?: string[];
    ingredientInfo?: {
        name: string;
        quality: 'Good' | 'Average' | 'Bad';
        warning?: string;
    }[];
    createdAt: Date;
}

const BlogSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    content: {
        type: String,
        required: [true, 'Please add content'],
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
    },
    category: {
        type: String,
        enum: ['Cooking Guide', 'Ingredient Screening', 'Risk Warning'],
        required: [true, 'Please add a category'],
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    riskAlerts: {
        type: [String],
        default: [],
    },
    ingredientInfo: [
        {
            name: String,
            quality: {
                type: String,
                enum: ['Good', 'Average', 'Bad'],
            },
            warning: String,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;
