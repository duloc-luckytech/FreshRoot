import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IIngredient {
    name: string;
    amount?: string;
    price?: number;
}

export interface IRecipe extends Document {
    title: string;
    description: string;
    category: string;
    foodGroup?: string;
    ingredients: IIngredient[];
    instructions: string[];
    image: string;
    costEstimate?: number;
    riskAlerts?: string[];
    shopId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const RecipeSchema: Schema<IRecipe> = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    category: {
        type: String,
        required: [true, 'Please choose a category'],
    },
    foodGroup: {
        type: String,
    },
    ingredients: [
        {
            name: { type: String, required: true },
            amount: { type: String },
            price: { type: Number },
        }
    ],
    instructions: [String],
    image: {
        type: String,
        default: 'no-photo.jpg',
    },
    costEstimate: {
        type: Number,
    },
    riskAlerts: {
        type: [String],
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Recipe: Model<IRecipe> = mongoose.model<IRecipe>('Recipe', RecipeSchema);
export default Recipe;
