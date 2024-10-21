import express from 'express';
import { getChannelSettings, getChannelSettingsByUserId, updateChannelSettings, getPresets, deleteChannel, addChannel } from '../controllers/channelSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getChannelSettings);
router.get('/presets/:userId', authenticateToken, getPresets);
router.get('/:userId', authenticateToken, getChannelSettingsByUserId);
router.put('/:userId', authenticateToken, updateChannelSettings);
router.delete('/:userId/:channelKey', deleteChannel);
router.post('/:userId', addChannel);

export default router;
