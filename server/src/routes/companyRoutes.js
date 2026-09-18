import express from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Public / Authenticated read routes
router.get('/', authenticateJWT, getCompanies);
router.get('/:id', authenticateJWT, getCompanyById);

// Admin-only management
router.post('/', authenticateJWT, requireRole('admin'), createCompany);
router.put('/:id', authenticateJWT, requireRole('admin'), updateCompany);
router.delete('/:id', authenticateJWT, requireRole('admin'), deleteCompany);

export default router;
