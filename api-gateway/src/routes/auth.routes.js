import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const authServiceProxy = createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  logLevel: 'silent'
});

// Public routes
router.post('/register', authServiceProxy);
router.post('/login', authServiceProxy);
router.post('/refresh-token', authServiceProxy);
router.post('/forgot-password', authServiceProxy);
router.post('/reset-password', authServiceProxy);

// Protected routes
router.post('/logout', authMiddleware.verifyToken, authServiceProxy);
router.get('/profile', authMiddleware.verifyToken, authServiceProxy);
router.put('/profile', authMiddleware.verifyToken, authServiceProxy);
router.put('/change-password', authMiddleware.verifyToken, authServiceProxy);

export default router;