import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getAnnouncements);
router.post('/', authenticateJWT, requireRole('admin'), createAnnouncement);
router.put('/:id', authenticateJWT, requireRole('admin'), updateAnnouncement);
router.delete('/:id', authenticateJWT, requireRole('admin'), deleteAnnouncement);

export default router;
