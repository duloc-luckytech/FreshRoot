import express from 'express';
import {
    createRecipe,
    createVoucher,
    deleteRecipe,
    deleteVoucher,
    getMyRecipes,
    getMyShop,
    getMyVouchers,
    updateRecipe,
    updateVoucher,
    upsertShop
} from '../controllers/agentController';
import { authMiddleware } from '../middleware/authMiddleware';
// Notice: We don't use agentMiddleware for upsertShop if we want to allow users to BECOME agents by creating a shop.
// However, the user said "agent nghĩa là chủ shop", so maybe they already have a shop or want to manage one.
// Let's use authMiddleware first, and inside upsertShop we can promote the user to agent.

const router = express.Router();

router.use(authMiddleware);

router.get('/shop', getMyShop);
router.post('/shop', upsertShop);
router.get('/recipes', getMyRecipes);
router.post('/recipes', createRecipe);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

router.get('/vouchers', getMyVouchers);
router.post('/vouchers', createVoucher);
router.put('/vouchers/:id', updateVoucher);
router.delete('/vouchers/:id', deleteVoucher);

export default router;
