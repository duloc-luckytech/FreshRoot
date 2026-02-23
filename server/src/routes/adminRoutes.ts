import express from 'express';
import {
    createShop,
    deleteBanner,
    deleteBlog,
    deleteClip,
    deleteDeal,
    deleteRecipe,
    deleteShop,
    deleteUser,
    deleteVoucher,
    getAdminStats,
    getAllBanners,
    getAllBlogs,
    getAllClips,
    getAllDeals,
    getAllOrders,
    getAllRecipes,
    getAllShops,
    getAllUsers,
    getAllVouchers,
    toggleBanner,
    toggleVoucher,
    updateOrderStatus,
    updateShop,
    updateUserRole,
} from '../controllers/adminController';

const router = express.Router();

// Dashboard
router.get('/stats', getAdminStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Shops
router.get('/shops', getAllShops);
router.post('/shops', createShop);
router.put('/shops/:id', updateShop);
router.delete('/shops/:id', deleteShop);

// Recipes
router.get('/recipes', getAllRecipes);
router.delete('/recipes/:id', deleteRecipe);

// Blogs
router.get('/blogs', getAllBlogs);
router.delete('/blogs/:id', deleteBlog);

// Deals
router.get('/deals', getAllDeals);
router.delete('/deals/:id', deleteDeal);

// Vouchers
router.get('/vouchers', getAllVouchers);
router.put('/vouchers/:id/toggle', toggleVoucher);
router.delete('/vouchers/:id', deleteVoucher);

// Banners
router.get('/banners', getAllBanners);
router.put('/banners/:id/toggle', toggleBanner);
router.delete('/banners/:id', deleteBanner);

// Clips
router.get('/clips', getAllClips);
router.delete('/clips/:id', deleteClip);

export default router;
