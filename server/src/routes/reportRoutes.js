import express from 'express';
import { getAnalytics, exportPlacementReport } from '../controllers/reportController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/analytics', authenticateJWT, requireRole('admin'), getAnalytics);
router.get('/export', authenticateJWT, requireRole('admin'), exportPlacementReport);

export default router;
