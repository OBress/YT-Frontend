import express from 'express';
import { getChannelSettings, getChannelSettingsByUserId, updateChannelSettings } from '../controllers/channelSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getChannelSettings);
router.get('/:userId', authenticateToken, getChannelSettingsByUserId);
router.put('/:userId', authenticateToken, updateChannelSettings);

export default router;
