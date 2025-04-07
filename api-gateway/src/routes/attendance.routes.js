import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const attendanceServiceProxy = createProxyMiddleware({
  target: config.services.attendance,
  changeOrigin: true,
  pathRewrite: {
    '^/api/attendance': '/api/attendance'
  },
  logLevel: 'silent'
});

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Attendance routes
router.post('/mark', attendanceServiceProxy); // For students to mark attendance
router.get('/student/:studentId', attendanceServiceProxy); // Get attendance by student ID
router.get('/class/:classId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Get attendance by class ID
router.get('/session/:sessionId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Get attendance by session ID

// Session routes
router.post('/sessions', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Create new session
router.get('/sessions', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Get all sessions
router.get('/sessions/:id', attendanceServiceProxy); // Get session by ID
router.put('/sessions/:id', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Update session
router.delete('/sessions/:id', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Delete session

// Record routes
router.get('/records', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Get all records
router.get('/records/:id', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), attendanceServiceProxy); // Get record by ID
router.get('/records/student/:studentId', attendanceServiceProxy); // Get records by student ID

export default router;