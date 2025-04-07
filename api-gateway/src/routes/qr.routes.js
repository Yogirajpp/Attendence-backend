import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const qrServiceProxy = createProxyMiddleware({
  target: config.services.qr,
  changeOrigin: true,
  pathRewrite: {
    '^/api/qr': '/api/qr'
  },
  logLevel: 'silent'
});

// All routes require authentication
router.use(authMiddleware.verifyToken);

// QR Code generation routes
router.post('/generate', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), qrServiceProxy); // Generate new QR code for a session
router.get('/session/:sessionId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), qrServiceProxy); // Get QR code for specific session

// QR Validation routes
router.post('/validate', qrServiceProxy); // Validate a scanned QR code
router.get('/validate/:qrToken', qrServiceProxy); // Check if a QR token is valid

export default router;