import { NextFunction, Response } from 'express';

export const agentMiddleware = (req: any, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'agent') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Agent role required.' });
    }
};
