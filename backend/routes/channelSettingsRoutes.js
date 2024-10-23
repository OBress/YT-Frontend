import express from 'express';
import { getChannelSettings, getChannelSettingsByUserId, updateChannelSettings, getPresets, deleteChannel, addChannel, getChannelNamesAndUploadDates } from '../controllers/channelSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getChannelSettings);
router.get('/presets/:userId', authenticateToken, getPresets);
router.get('/:userId', authenticateToken, getChannelSettingsByUserId);
router.put('/:userId', authenticateToken, updateChannelSettings);
router.delete('/:userId/:channelKey',authenticateToken,  deleteChannel);
router.post('/:userId', authenticateToken, addChannel);
router.get('/names-and-dates/:userId', authenticateToken, getChannelNamesAndUploadDates);



export default router;
