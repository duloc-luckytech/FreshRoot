import { NextFunction, Request, Response } from 'express';
import Deal from '../models/Deal';

// @desc    Get all deals with optional location filter
// @route   GET /api/deals
// @access  Public
export const getDeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lat, lng, distance } = req.query;
        let query: any = {};

        // If lat/lng provided, find deals within radius (default 5km)
        if (lat && lng) {
            const radius = distance ? Number(distance) / 6371 : 5 / 6371; // radius in radians
            query.location = {
                $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radius] }
            };
        }

        const deals = await Deal.find(query);

        res.status(200).json({
            success: true,
            count: deals.length,
            data: deals,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new deal
// @route   POST /api/deals
// @access  Private
export const createDeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deal = await Deal.create(req.body);
        res.status(201).json({ success: true, data: deal });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};
