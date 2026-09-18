import express from 'express';
import {
  getDrives,
  getEligibleDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
} from '../controllers/driveController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/eligible', authenticateJWT, requireRole('student'), getEligibleDrives);
router.get('/', authenticateJWT, getDrives);
router.get('/:id', authenticateJWT, getDriveById);

// Admin & Recruiter creation/updates
router.post('/', authenticateJWT, requireRole('admin', 'recruiter'), createDrive);
router.put('/:id', authenticateJWT, requireRole('admin', 'recruiter'), updateDrive);
router.delete('/:id', authenticateJWT, requireRole('admin'), deleteDrive);

export default router;
