import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const analyticsServiceProxy = createProxyMiddleware({
  target: config.services.analytics,
  changeOrigin: true,
  pathRewrite: {
    '^/api/analytics': '/api/analytics'
  },
  logLevel: 'silent'
});

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Analytics routes
router.get('/attendance/summary', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Get attendance summary
router.get('/attendance/course/:courseId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Get attendance for a course
router.get('/attendance/student/:studentId', analyticsServiceProxy); // Get attendance for a student
router.get('/attendance/teacher/:teacherId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Get attendance for classes taught by a teacher

// Report routes
router.get('/reports', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Get all reports
router.get('/reports/:id', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Get specific report
router.post('/reports/generate', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Generate a new report
router.get('/reports/download/:id', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Download a report

// Dashboard routes
router.get('/dashboard', analyticsServiceProxy); // Get dashboard data based on user role
router.get('/dashboard/college/:collegeId', authMiddleware.checkRole(['admin', 'college_admin']), analyticsServiceProxy); // Get college dashboard
router.get('/dashboard/department/:departmentId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), analyticsServiceProxy); // Get department dashboard

export default router;