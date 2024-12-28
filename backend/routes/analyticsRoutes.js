import express from 'express';
import { getChannelAnalyticsHistory, updateChannelAnalytics } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', authenticateToken, getChannelAnalyticsHistory);
router.post('/:userId', authenticateToken, updateChannelAnalytics);

export default router; 