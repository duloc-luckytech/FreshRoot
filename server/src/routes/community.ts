import express from 'express';
import { createClip, getClips, getRankings } from '../controllers/community';

const router = express.Router();

router.get('/rankings', getRankings);
router.route('/clips')
    .get(getClips)
    .post(createClip);

export default router;
