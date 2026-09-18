import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateJWT, getDashboardStats);

export default router;
