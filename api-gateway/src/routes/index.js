import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import collegeRoutes from './college.routes.js';
import attendanceRoutes from './attendance.routes.js';
import qrRoutes from './qr.routes.js';
import biometricRoutes from './biometric.routes.js';
import notificationRoutes from './notification.routes.js';
import analyticsRoutes from './analytics.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway-router' });
});

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/colleges', collegeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/qr', qrRoutes);
router.use('/biometric', biometricRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

export default router;