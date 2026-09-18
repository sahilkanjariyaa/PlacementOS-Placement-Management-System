import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getNotifications);
router.put('/:id/read', authenticateJWT, markAsRead);
router.put('/read-all', authenticateJWT, markAllAsRead);

export default router;
