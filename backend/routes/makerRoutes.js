import express from 'express';
import { createVideos, getJobStatus } from '../controllers/makerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-videos', authenticateToken, createVideos);
router.get('/job-status/:jobId', authenticateToken, getJobStatus);

export default router;
