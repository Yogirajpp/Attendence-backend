import express from 'express';
import studentController from '../controllers/student.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'student-routes' });
});

// Protected routes - Student profile
router.get('/profile', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['student']), 
  studentController.getStudentProfile
);

// Protected routes - Admin and teachers
router.get('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin', 'teacher']), 
  studentController.getAllStudents
);
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateCreateStudent, 
  studentController.createStudent
);
router.get('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin', 'teacher']), 
  validators.validateObjectId('id'), 
  studentController.getStudentById
);
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateStudent, 
  studentController.updateStudent
);
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin']), 
  validators.validateObjectId('id'), 
  studentController.deleteStudent
);

// Routes for filtering students
router.get('/course/:courseId', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin', 'teacher']), 
  validators.validateObjectId('courseId'), 
  studentController.getStudentsByCourse
);
router.get('/department/:departmentId', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin', 'teacher']), 
  validators.validateObjectId('departmentId'), 
  studentController.getStudentsByDepartment
);
router.get('/college/:collegeId', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin', 'teacher']), 
  validators.validateObjectId('collegeId'), 
  studentController.getStudentsByCollege
);

export default router;