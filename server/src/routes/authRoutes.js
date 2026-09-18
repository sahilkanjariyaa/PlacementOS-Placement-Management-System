import express from 'express';
import {
  requestSignupOtp,
  verifySignupOtp,
  requestLoginOtp,
  verifyLoginOtp,
  resendOtp,
  getMe,
  logout,
} from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { validateSignupRequest, validateLoginRequest } from '../validators/authValidator.js';

const router = express.Router();

// Public OTP Auth Routes
router.post('/request-signup-otp', validateSignupRequest, requestSignupOtp);
router.post('/verify-signup-otp', verifySignupOtp);
router.post('/request-login-otp', validateLoginRequest, requestLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-otp', resendOtp);

// Authenticated Routes
router.get('/me', authenticateJWT, getMe);
router.post('/logout', logout);

export default router;
