import express from 'express';
import { createBanner, getBanners } from '../controllers/banners';

const router = express.Router();

router.route('/')
    .get(getBanners)
    .post(createBanner);

export default router;
