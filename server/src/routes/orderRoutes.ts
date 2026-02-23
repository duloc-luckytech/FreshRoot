import express from 'express';
import { createOrder, getMyOrders, updatePaymentStatus } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/my', authMiddleware, getMyOrders);
router.put('/payment-status', updatePaymentStatus);

export default router;
