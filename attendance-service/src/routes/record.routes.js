import express from 'express';
import recordController from '../controllers/record.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'record-routes' });
});

// Protected routes
router.get('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  recordController.getAllRecords
);

router.get('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('id'), 
  recordController.getRecordById
);

router.get('/course/:courseId', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('courseId'), 
  recordController.getRecordsByCourse
);

router.get('/student/:studentId', 
  authMiddleware.verifyToken, 
  recordController.getRecordsByStudent
);

router.get('/teacher/:teacherId', 
  authMiddleware.verifyToken, 
  recordController.getRecordsByTeacher
);

router.get('/class/:classId/statistics', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('classId'), 
  recordController.getClassStatistics
);

router.post('/:id/regenerate', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['college_admin', 'admin']), 
  validators.validateObjectId('id'), 
  recordController.regenerateRecord
);

export default router;