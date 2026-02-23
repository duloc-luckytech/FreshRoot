import express from 'express';
import { createDeal, getDeals } from '../controllers/deals';

const router = express.Router();

router.route('/')
    .get(getDeals)
    .post(createDeal);

export default router;
