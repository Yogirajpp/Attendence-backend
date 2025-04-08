import express from 'express';
import sessionController from '../controllers/session.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'session-routes' });
});

// Protected routes
router.get('/', 
  authMiddleware.verifyToken, 
  sessionController.getAllSessions
);

router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateCreateSession, 
  sessionController.createSession
);

router.get('/:id', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('id'), 
  sessionController.getSessionById
);

router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateSession, 
  sessionController.updateSession
);

router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('id'), 
  sessionController.deleteSession
);

router.post('/:id/cancel', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('id'), 
  validators.validateCancelSession, 
  sessionController.cancelSession
);

router.post('/:id/qr', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('id'), 
  sessionController.generateQrCode
);

router.get('/student/:studentId', 
  authMiddleware.verifyToken, 
  sessionController.getSessionsByStudent
);

router.get('/teacher/:teacherId', 
  authMiddleware.verifyToken, 
  sessionController.getSessionsByTeacher
);

export default router;