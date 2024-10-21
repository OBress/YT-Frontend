import express from 'express';
import { getUserSettings, updateUserSettings } from '../controllers/userSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', authenticateToken, getUserSettings);
router.put('/:userId', authenticateToken, updateUserSettings);

export default router;
