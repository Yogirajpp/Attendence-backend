import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const adminServiceProxy = createProxyMiddleware({
  target: config.services.admin,
  changeOrigin: true,
  pathRewrite: {
    '^/api/admin': '/api/admin'
  },
  logLevel: 'silent'
});

// All routes require authentication and admin access
router.use(authMiddleware.verifyToken, authMiddleware.checkRole(['admin']));

// Admin operations routes
router.get('/users', adminServiceProxy); // Get all users
router.post('/users', adminServiceProxy); // Create a user with any role
router.put('/users/:id', adminServiceProxy); // Update any user
router.delete('/users/:id', adminServiceProxy); // Delete any user

// Company routes
router.get('/companies', adminServiceProxy); // Get all companies
router.get('/companies/:id', adminServiceProxy); // Get specific company
router.post('/companies', adminServiceProxy); // Create new company
router.put('/companies/:id', adminServiceProxy); // Update company
router.delete('/companies/:id', adminServiceProxy); // Delete company

// Settings routes
router.get('/settings', adminServiceProxy); // Get all settings
router.put('/settings', adminServiceProxy); // Update settings
router.post('/settings/reset', adminServiceProxy); // Reset settings to default

export default router;