import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import connectDB from './config/db';

// Route files
import path from 'path';
import account from './routes/accountRoutes';
import admin from './routes/adminRoutes';
import agent from './routes/agentRoutes';
import ai from './routes/aiRoutes';
import auth from './routes/auth';
import banners from './routes/banners';
import blogs from './routes/blogRoutes';
import community from './routes/community';
import deals from './routes/deals';
import notifications from './routes/notificationRoutes';
import orders from './routes/orderRoutes';
import recipes from './routes/recipes';
import shops from './routes/shops';
import upload from './routes/uploadRoutes';

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
    // Seed Admin User
    try {
        const User = require('./models/User').default;
        const adminExists = await User.findOne({ email: 'admin' });
        if (!adminExists) {
            await User.create({
                name: 'Administrator',
                email: 'admin',
                password: 'admin',
                role: 'admin',
                isActive: true,
                rank: 'Challenger'
            });
            console.log('Admin user created (admin/admin)');
        }
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
});

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/recipes', recipes);
app.use('/api/deals', deals);
app.use('/api/community', community);
app.use('/api/banners', banners);
app.use('/api/shops', shops);
app.use('/api/orders', orders);
app.use('/api/account', account);
app.use('/api/notifications', notifications);
app.use('/api/agent', agent);
app.use('/api/blogs', blogs);
app.use('/api/ai', ai);
app.use('/api/upload', upload);
app.use('/api/admin', admin);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Food & Community API' });
});

// Port configuration
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
