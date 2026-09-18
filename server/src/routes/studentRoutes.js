import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllStudents,
  getStudentById,
  updateStudentStatus,
} from '../controllers/studentController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Student routes
router.get('/profile', authenticateJWT, requireRole('student'), getProfile);
router.put('/profile', authenticateJWT, requireRole('student'), updateProfile);

// Admin & Recruiter routes
router.get('/', authenticateJWT, requireRole('admin'), getAllStudents);
router.get('/:id', authenticateJWT, requireRole('admin', 'recruiter'), getStudentById);
router.put('/:id/status', authenticateJWT, requireRole('admin'), updateStudentStatus);

export default router;
