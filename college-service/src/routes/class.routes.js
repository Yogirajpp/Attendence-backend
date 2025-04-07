import express from 'express';
import classController from '../controllers/class.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'class-routes' });
});

// Protected routes with different access levels
router.get('/', authMiddleware.verifyToken, classController.getAllClasses);
router.get('/:id', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('id'), 
  classController.getClassById
);

// Routes requiring admin, college admin, or teacher access for creation and updates
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin', 'teacher']), 
  validators.validateCreateClass, 
  classController.createClass
);
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin', 'teacher']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateClass, 
  classController.updateClass
);
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  classController.deleteClass
);

// Routes for filtering classes
router.get('/course/:courseId', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('courseId'), 
  classController.getClassesByCourse
);
router.get('/teacher/:teacherId', 
  authMiddleware.verifyToken, 
  classController.getClassesByTeacher
);
router.get('/subject/:subjectId', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('subjectId'), 
  classController.getClassesBySubject
);

// Routes for student management in classes
router.post('/:id/students', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), 
  validators.validateObjectId('id'), 
  validators.validateStudentEnrollment, 
  classController.enrollStudents
);
router.delete('/:id/students', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin', 'teacher']), 
  validators.validateObjectId('id'), 
  validators.validateStudentEnrollment, 
  classController.removeStudents
);

export default router;