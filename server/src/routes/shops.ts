import express from 'express';
import { createShop, getShop, getShops } from '../controllers/shops';

const router = express.Router();

router.route('/')
    .get(getShops)
    .post(createShop);

router.route('/:id')
    .get(getShop);

export default router;
