import express from 'express';
import { getChannelAnalytics, updateChannelAnalytics } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', authenticateToken, getChannelAnalytics);
router.post('/:userId', authenticateToken, updateChannelAnalytics);

export default router; 