import express from 'express';
import { createVideos } from '../controllers/makerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-videos', authenticateToken, createVideos);

export default router;
