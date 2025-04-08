import express from 'express';
import attendanceController from '../controllers/attendance.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'attendance-routes' });
});

// Protected routes
router.post('/mark', 
  authMiddleware.verifyToken, 
  validators.validateMarkAttendance, 
  attendanceController.markAttendance
);

router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateAttendance, 
  attendanceController.updateAttendance
);

router.get('/session/:sessionId', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('sessionId'), 
  attendanceController.getAttendanceBySession
);

router.get('/student/:studentId', 
  authMiddleware.verifyToken, 
  attendanceController.getAttendanceByStudent
);

router.get('/student/:studentId/summary', 
  authMiddleware.verifyToken, 
  attendanceController.getStudentAttendanceSummary
);

router.post('/bulk', 
    authMiddleware.verifyToken, 
    authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
    validators.validateBulkAttendance, 
    attendanceController.markBulkAttendance
  );
  
export default router;