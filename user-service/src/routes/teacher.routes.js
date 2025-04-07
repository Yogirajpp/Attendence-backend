import express from 'express';
import teacherController from '../controllers/teacher.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'teacher-routes' });
});

// Protected routes - Teacher profile
router.get('/profile', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher']), 
  teacherController.getTeacherProfile
);

// Protected routes - Admin
router.get('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  teacherController.getAllTeachers
);
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateCreateTeacher, 
  teacherController.createTeacher
);
router.get('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  teacherController.getTeacherById
);
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateTeacher, 
  teacherController.updateTeacher
);
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin']), 
  validators.validateObjectId('id'), 
  teacherController.deleteTeacher
);

// Routes for subject assignment
router.post('/:id/subjects', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateSubjectAssignment, 
  teacherController.assignSubjects
);
router.delete('/:id/subjects', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateSubjectAssignment, 
  teacherController.removeSubjects
);

// Routes for filtering teachers
router.get('/subject/:subjectId', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('subjectId'), 
  teacherController.getTeachersBySubject
);
router.get('/department/:departmentId', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('departmentId'), 
  teacherController.getTeachersByDepartment
);
router.get('/college/:collegeId', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('collegeId'), 
  teacherController.getTeachersByCollege
);

export default router;