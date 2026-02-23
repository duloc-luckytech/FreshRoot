import { Request, Response } from 'express';
import Notification from '../models/Notification';
import Order from '../models/Order';

// MoMo Configuration (Mock/Sandbox)
const MOMO_CONFIG = {
    partnerCode: 'MOMOBKUN20180529', // Example partner code
    accessKey: 'klm0568887un8963',
    secretKey: 'at67ab67un8963',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
};

export const createOrder = async (req: any, res: Response) => {
    try {
        const { shopId, items, totalAmount, paymentMethod } = req.body;
        const userId = req.user.id;

        const order = new Order({
            userId,
            shopId,
            items,
            totalAmount,
            paymentMethod,
            status: 'pending',
            paymentStatus: 'pending',
        });

        await order.save();

        if (paymentMethod === 'momo') {
            // Simulate MoMo Payment URL Generation
            const orderId = order._id.toString();
            const requestId = orderId + '_' + Date.now();

            // For MVP: Auto-success
            order.status = 'paid';
            order.paymentStatus = 'success';
            order.momoOrderId = orderId;
            order.momoRequestId = requestId;
            await order.save();

            // Create Notification
            await Notification.create({
                userId,
                title: 'Thanh toán thành công',
                message: `Đơn hàng #${orderId.slice(-6)} đã được thanh toán qua MoMo.`,
                type: 'order'
            });

            const payUrl = `https://test-payment.momo.vn/v2/gateway/api/create?partnerCode=${MOMO_CONFIG.partnerCode}&orderId=${orderId}&requestId=${requestId}`;

            return res.status(201).json({
                success: true,
                order,
                payUrl,
            });
        }

        // Create Notification for COD
        if (paymentMethod === 'cod') {
            await Notification.create({
                userId,
                title: 'Đặt hàng thành công',
                message: `Đơn hàng #${order._id.toString().slice(-6)} đã được ghi nhận. Thanh toán khi nhận hàng.`,
                type: 'order'
            });
        }

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyOrders = async (req: any, res: Response) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('shopId', 'name image')
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.paymentStatus = status; // 'success' or 'failed'
        if (status === 'success') {
            order.status = 'paid';
        }

        await order.save();
        res.json({ success: true, order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .populate('shopId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
