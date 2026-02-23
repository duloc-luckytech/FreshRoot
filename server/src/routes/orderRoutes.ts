import express from 'express';
import { createOrder, getAllOrders, getMyOrders, updatePaymentStatus } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(authMiddleware, createOrder)
    .get(getAllOrders);
router.get('/my', authMiddleware, getMyOrders);
router.put('/payment-status', updatePaymentStatus);

export default router;
