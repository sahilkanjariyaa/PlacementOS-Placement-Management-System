import express from 'express';
import {
  applyToDrive,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Student 1-click apply and view personal applications
router.post('/:driveId', authenticateJWT, requireRole('student'), applyToDrive);
router.get('/my', authenticateJWT, requireRole('student'), getMyApplications);

// Admin & Recruiter application management
router.get('/', authenticateJWT, requireRole('admin', 'recruiter'), getApplications);
router.get('/:id', authenticateJWT, getApplicationById);
router.put('/:id/status', authenticateJWT, requireRole('admin', 'recruiter'), updateApplicationStatus);

export default router;
