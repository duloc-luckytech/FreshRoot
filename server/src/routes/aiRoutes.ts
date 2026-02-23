import express from 'express';
import { askAI } from '../controllers/aiController';

const router = express.Router();

router.post('/ask', askAI);

export default router;
