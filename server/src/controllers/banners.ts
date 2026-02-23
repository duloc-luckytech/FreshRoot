import { NextFunction, Request, Response } from 'express';
import Banner from '../models/Banner';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const banners = await Banner.find({ active: true });

        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private (Admin)
export const createBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const banner = await Banner.create(req.body);

        res.status(201).json({
            success: true,
            data: banner,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};
