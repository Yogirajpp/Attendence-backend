import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Proxy middleware configuration
const userServiceProxy = createProxyMiddleware({
  target: config.services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  logLevel: 'silent'
});

// User routes (protected)
router.use(authMiddleware.verifyToken);

// General user routes
router.get('/', authMiddleware.checkRole(['admin']), userServiceProxy);
router.get('/:id', userServiceProxy);
router.put('/:id', userServiceProxy);
router.delete('/:id', authMiddleware.checkRole(['admin']), userServiceProxy);

// Student-specific routes
router.get('/students', authMiddleware.checkRole(['admin', 'teacher']), userServiceProxy);
router.get('/students/:id', userServiceProxy);

// Teacher-specific routes
router.get('/teachers', authMiddleware.checkRole(['admin']), userServiceProxy);
router.get('/teachers/:id', userServiceProxy);

export default router;