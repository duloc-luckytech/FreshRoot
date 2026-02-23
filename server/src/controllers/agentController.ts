import { Response } from 'express';
import Recipe from '../models/Recipe';
import Shop from '../models/Shop';
import User from '../models/User';
import Voucher from '../models/Voucher';

// @desc    Get current agent's shop
// @route   GET /api/agent/shop
// @access  Private/Agent
export const getMyShop = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found for this agent' });
        }
        res.json({ success: true, shop });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create or Update agent's shop
// @route   POST /api/agent/shop
// @access  Private/Agent
export const upsertShop = async (req: any, res: Response) => {
    try {
        const { name, image, address, location, categories } = req.body;

        let shop = await Shop.findOne({ ownerId: req.user.id });

        const shopData = {
            name,
            image,
            address,
            location,
            categories,
            ownerId: req.user.id
        };

        if (shop) {
            shop = await Shop.findByIdAndUpdate(shop._id, shopData, { new: true, runValidators: true });
        } else {
            shop = await Shop.create(shopData);
            // Ensure user role is agent
            await User.findByIdAndUpdate(req.user.id, { role: 'agent' });
        }

        res.json({ success: true, shop });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get recipes for agent's shop
// @route   GET /api/agent/recipes
// @access  Private/Agent
export const getMyRecipes = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        const recipes = await Recipe.find({ shopId: shop._id });
        res.json({ success: true, recipes });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create recipe for agent's shop
// @route   POST /api/agent/recipes
// @access  Private/Agent
export const createRecipe = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        const { title, description, image, costEstimate, category, ingredients, instructions } = req.body;

        const recipe = await Recipe.create({
            title,
            description,
            image,
            costEstimate,
            category,
            ingredients,
            instructions,
            shopId: shop._id
        });

        res.status(201).json({ success: true, recipe });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update recipe
// @route   PUT /api/agent/recipes/:id
// @access  Private/Agent
export const updateRecipe = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        let recipe = await Recipe.findOne({ _id: req.params.id, shopId: shop._id });
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, recipe });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete recipe
// @route   DELETE /api/agent/recipes/:id
// @access  Private/Agent
export const deleteRecipe = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, shopId: shop._id });
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        res.json({ success: true, message: 'Recipe removed' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get vouchers for agent's shop
// @route   GET /api/agent/vouchers
// @access  Private/Agent
export const getMyVouchers = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        const vouchers = await Voucher.find({ shopId: shop._id });
        res.json({ success: true, vouchers });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create voucher
// @route   POST /api/agent/vouchers
// @access  Private/Agent
export const createVoucher = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        const { code, discountAmount, discountType, minOrderAmount, expiryDate } = req.body;

        const voucher = await Voucher.create({
            code,
            discountAmount,
            discountType,
            minOrderAmount,
            expiryDate,
            shopId: shop._id
        });

        res.status(201).json({ success: true, voucher });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update voucher
// @route   PUT /api/agent/vouchers/:id
// @access  Private/Agent
export const updateVoucher = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        let voucher = await Voucher.findOne({ _id: req.params.id, shopId: shop._id });
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, voucher });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete voucher
// @route   DELETE /api/agent/vouchers/:id
// @access  Private/Agent
export const deleteVoucher = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        const voucher = await Voucher.findOneAndDelete({ _id: req.params.id, shopId: shop._id });
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        res.json({ success: true, message: 'Voucher removed' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

