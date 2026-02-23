import { Request, Response } from 'express';
import Blog from '../models/Blog';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await Blog.find().populate('author', 'name avatar');
        res.json({ success: true, count: blogs.length, data: blogs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
export const getBlog = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name avatar');
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        res.json({ success: true, data: blog });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create blog (for Admin/Agents)
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req: any, res: Response) => {
    try {
        req.body.author = req.user.id;
        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true, data: blog });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
