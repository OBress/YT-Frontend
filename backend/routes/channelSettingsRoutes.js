import express from 'express';
import { getChannelSettings, getChannelSettingsByUserId } from '../controllers/channelSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getChannelSettings);
router.get('/:userId', authenticateToken, getChannelSettingsByUserId);

export default router;
