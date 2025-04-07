import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const biometricServiceProxy = createProxyMiddleware({
  target: config.services.biometric,
  changeOrigin: true,
  pathRewrite: {
    '^/api/biometric': '/api/biometric'
  },
  logLevel: 'silent'
});

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Fingerprint routes
router.post('/fingerprints/register', biometricServiceProxy); // Register new fingerprint
router.get('/fingerprints/:userId', authMiddleware.checkRole(['admin', 'college_admin']), biometricServiceProxy); // Get user's fingerprints
router.delete('/fingerprints/:id', biometricServiceProxy); // Delete fingerprint

// Verification routes
router.post('/verification', biometricServiceProxy); // Verify a fingerprint
router.post('/verification/attendance', biometricServiceProxy); // Verify fingerprint for attendance

export default router;