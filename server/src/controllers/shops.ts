import { NextFunction, Request, Response } from 'express';
import Shop from '../models/Shop';

// @desc    Get shops
// @route   GET /api/shops
// @access  Public
export const getShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { isFeatured, lat, lng, radius, search, onSale } = req.query;
        let query: any = {};

        if (isFeatured === 'true') {
            query.isFeatured = true;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (onSale === 'true') {
            query.discountLabel = { $exists: true, $ne: '' };
        }

        // Geospatial query
        if (lat && lng) {
            const distance = radius ? Number(radius) : 5; // Default 5km
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(lng), Number(lat)],
                    },
                    $maxDistance: distance * 1000, // MongoDB uses meters
                },
            };
        }

        const shops = await Shop.find(query);

        res.status(200).json({
            success: true,
            count: shops.length,
            data: shops,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get a single shop
// @route   GET /api/shops/:id
// @access  Public
export const getShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        res.status(200).json({
            success: true,
            data: shop,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a shop
// @route   POST /api/shops
// @access  Private (Admin)
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop = await Shop.create(req.body);

        res.status(201).json({
            success: true,
            data: shop,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};
