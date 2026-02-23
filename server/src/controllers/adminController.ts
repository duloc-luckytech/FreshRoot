import { Response } from 'express';
import Banner from '../models/Banner';
import Blog from '../models/Blog';
import Clip from '../models/Clip';
import Deal from '../models/Deal';
import Order from '../models/Order';
import Recipe from '../models/Recipe';
import Shop from '../models/Shop';
import User from '../models/User';
import Voucher from '../models/Voucher';

// ─── Dashboard Stats ─────────────────────────────────────────
export const getAdminStats = async (req: any, res: Response) => {
    try {
        const [userCount, shopCount, orderCount, blogCount, recipeCount, dealCount, voucherCount, bannerCount, clipCount] = await Promise.all([
            User.countDocuments(),
            Shop.countDocuments(),
            Order.countDocuments(),
            Blog.countDocuments(),
            Recipe.countDocuments(),
            Deal.countDocuments(),
            Voucher.countDocuments(),
            Banner.countDocuments(),
            Clip.countDocuments(),
        ]);

        const orders = await Order.find({});
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const activeShops = await Shop.countDocuments({ isVerified: true });
        const pendingShops = await Shop.countDocuments({ isVerified: false });

        res.json({
            success: true,
            data: {
                totalRevenue,
                userCount,
                shopCount,
                activeShops,
                pendingShops,
                orderCount,
                pendingOrders,
                completedOrders,
                blogCount,
                recipeCount,
                dealCount,
                voucherCount,
                bannerCount,
                clipCount,
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Users ───────────────────────────────────────────────────
export const getAllUsers = async (req: any, res: Response) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserRole = async (req: any, res: Response) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req: any, res: Response) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Orders ──────────────────────────────────────────────────
export const getAllOrders = async (req: any, res: Response) => {
    try {
        const orders = await Order.find({}).populate('userId', 'name email').populate('shopId', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateOrderStatus = async (req: any, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Shops ───────────────────────────────────────────────────
export const getAllShops = async (req: any, res: Response) => {
    try {
        const shops = await Shop.find({}).populate('ownerId', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, data: shops });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createShop = async (req: any, res: Response) => {
    try {
        const shop = await Shop.create(req.body);
        res.status(201).json({ success: true, data: shop });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateShop = async (req: any, res: Response) => {
    try {
        const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: shop });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteShop = async (req: any, res: Response) => {
    try {
        await Shop.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Shop deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Recipes ─────────────────────────────────────────────────
export const getAllRecipes = async (req: any, res: Response) => {
    try {
        const recipes = await Recipe.find({}).populate('shopId', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: recipes });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteRecipe = async (req: any, res: Response) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Recipe deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Blogs ───────────────────────────────────────────────────
export const getAllBlogs = async (req: any, res: Response) => {
    try {
        const blogs = await Blog.find({}).populate('author', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: blogs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBlog = async (req: any, res: Response) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Blog deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Deals ───────────────────────────────────────────────────
export const getAllDeals = async (req: any, res: Response) => {
    try {
        const deals = await Deal.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: deals });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDeal = async (req: any, res: Response) => {
    try {
        await Deal.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deal deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Vouchers ────────────────────────────────────────────────
export const getAllVouchers = async (req: any, res: Response) => {
    try {
        const vouchers = await Voucher.find({}).populate('shopId', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: vouchers });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleVoucher = async (req: any, res: Response) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) return res.status(404).json({ success: false, message: 'Not found' });
        voucher.isActive = !voucher.isActive;
        await voucher.save();
        res.json({ success: true, data: voucher });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteVoucher = async (req: any, res: Response) => {
    try {
        await Voucher.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Voucher deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Banners ─────────────────────────────────────────────────
export const getAllBanners = async (req: any, res: Response) => {
    try {
        const banners = await Banner.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: banners });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleBanner = async (req: any, res: Response) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: 'Not found' });
        banner.active = !banner.active;
        await banner.save();
        res.json({ success: true, data: banner });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBanner = async (req: any, res: Response) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Banner deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Clips ───────────────────────────────────────────────────
export const getAllClips = async (req: any, res: Response) => {
    try {
        const clips = await Clip.find({}).populate('user', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: clips });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteClip = async (req: any, res: Response) => {
    try {
        await Clip.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Clip deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
