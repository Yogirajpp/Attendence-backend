import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const notificationServiceProxy = createProxyMiddleware({
  target: config.services.notification,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api/notifications'
  },
  logLevel: 'silent'
});

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Notification routes
router.get('/', notificationServiceProxy); // Get all notifications for the user
router.get('/:id', notificationServiceProxy); // Get specific notification
router.post('/', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), notificationServiceProxy); // Create new notification
router.put('/:id/read', notificationServiceProxy); // Mark notification as read
router.delete('/:id', notificationServiceProxy); // Delete notification

// Email routes
router.post('/email', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), notificationServiceProxy); // Send email
router.post('/email/template', authMiddleware.checkRole(['admin', 'college_admin']), notificationServiceProxy); // Create email template
router.get('/email/templates', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), notificationServiceProxy); // Get all email templates

// Push notification routes
router.post('/push', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), notificationServiceProxy); // Send push notification
router.post('/push/subscribe', notificationServiceProxy); // Subscribe to push notifications
router.delete('/push/unsubscribe', notificationServiceProxy); // Unsubscribe from push notifications

export default router;