import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const collegeServiceProxy = createProxyMiddleware({
  target: config.services.college,
  changeOrigin: true,
  pathRewrite: {
    '^/api/colleges': '/api/colleges'
  },
  logLevel: 'silent'
});

// All routes require authentication
router.use(authMiddleware.verifyToken);

// College routes
router.get('/', collegeServiceProxy);
router.get('/:id', collegeServiceProxy);
router.post('/', authMiddleware.checkRole(['admin', 'company_admin']), collegeServiceProxy);
router.put('/:id', authMiddleware.checkRole(['admin', 'company_admin']), collegeServiceProxy);
router.delete('/:id', authMiddleware.checkRole(['admin', 'company_admin']), collegeServiceProxy);

// Department routes
router.get('/:collegeId/departments', collegeServiceProxy);
router.get('/:collegeId/departments/:departmentId', collegeServiceProxy);
router.post('/:collegeId/departments', authMiddleware.checkRole(['admin', 'college_admin']), collegeServiceProxy);
router.put('/:collegeId/departments/:departmentId', authMiddleware.checkRole(['admin', 'college_admin']), collegeServiceProxy);
router.delete('/:collegeId/departments/:departmentId', authMiddleware.checkRole(['admin', 'college_admin']), collegeServiceProxy);

// Course routes
router.get('/:collegeId/courses', collegeServiceProxy);
router.get('/:collegeId/courses/:courseId', collegeServiceProxy);
router.post('/:collegeId/courses', authMiddleware.checkRole(['admin', 'college_admin']), collegeServiceProxy);
router.put('/:collegeId/courses/:courseId', authMiddleware.checkRole(['admin', 'college_admin']), collegeServiceProxy);
router.delete('/:collegeId/courses/:courseId', authMiddleware.checkRole(['admin', 'college_admin']), collegeServiceProxy);

// Class routes
router.get('/:collegeId/classes', collegeServiceProxy);
router.get('/:collegeId/classes/:classId', collegeServiceProxy);
router.post('/:collegeId/classes', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), collegeServiceProxy);
router.put('/:collegeId/classes/:classId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), collegeServiceProxy);
router.delete('/:collegeId/classes/:classId', authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), collegeServiceProxy);

export default router;