import { NextFunction, Request, Response } from 'express';
import Recipe from '../models/Recipe';

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
export const getRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, foodGroup, maxPrice, search, shopId } = req.query;
        let query: any = {};

        if (shopId) {
            query.shopId = shopId;
        }

        if (category) {
            query.category = category;
        }

        if (foodGroup) {
            query.foodGroup = foodGroup;
        }

        if (maxPrice) {
            query.costEstimate = { $lte: Number(maxPrice) };
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const recipes = await Recipe.find(query);

        res.status(200).json({
            success: true,
            count: recipes.length,
            data: recipes,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        res.status(200).json({ success: true, data: recipe });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private (Admin or similar later)
export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipe = await Recipe.create(req.body);
        res.status(201).json({ success: true, data: recipe });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};
