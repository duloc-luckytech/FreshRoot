import { NextFunction, Request, Response } from 'express';
import Clip from '../models/Clip';
import User from '../models/User';

// Custom interface for Request with user
interface AuthRequest extends Request {
    user?: any;
}

// @desc    Get leaderboard rankings
// @route   GET /api/community/rankings
// @access  Public
export const getRankings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find()
            .sort({ points: -1 })
            .limit(20)
            .select('name rank points avatar');

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all clips
// @route   GET /api/community/clips
// @access  Public
export const getClips = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clips = await Clip.find().populate('user', 'name rank avatar');

        res.status(200).json({
            success: true,
            count: clips.length,
            data: clips,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Upload new clip
// @route   POST /api/community/clips
// @access  Private
export const createClip = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user) {
            req.body.user = req.user.id;
        }
        const clip = await Clip.create(req.body);
        res.status(201).json({ success: true, data: clip });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};
