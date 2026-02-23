import express from 'express';
import { createBlog, getBlog, getBlogs } from '../controllers/blogController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getBlogs);
router.get('/:id', getBlog);
router.post('/', authMiddleware, createBlog);

export default router;
