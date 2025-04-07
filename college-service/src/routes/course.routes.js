import express from 'express';
import courseController from '../controllers/course.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'course-routes' });
});

// Protected routes with different access levels
router.get('/', authMiddleware.verifyToken, courseController.getAllCourses);
router.get('/:id', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('id'), 
  courseController.getCourseById
);

// Routes requiring admin or college admin access
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateCreateCourse, 
  courseController.createCourse
);
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateCourse, 
  courseController.updateCourse
);
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  courseController.deleteCourse
);

// Routes for filtering courses
router.get('/department/:departmentId', 
    authMiddleware.verifyToken, 
    validators.validateObjectId('departmentId'), 
    courseController.getCoursesByDepartment
  );
  router.get('/college/:collegeId', 
    authMiddleware.verifyToken, 
    validators.validateObjectId('collegeId'), 
    courseController.getCoursesByCollege
  );
  
  // Routes for syllabus management
  router.post('/:id/syllabus', 
    authMiddleware.verifyToken, 
    authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
    validators.validateObjectId('id'), 
    validators.validateSyllabusItem, 
    courseController.addSyllabusItem
  );
  router.delete('/:id/syllabus/:syllabusItemId', 
    authMiddleware.verifyToken, 
    authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
    validators.validateObjectId('id'), 
    validators.validateObjectId('syllabusItemId'), 
    courseController.removeSyllabusItem
  );
  
  // Routes for subject management
  router.post('/:id/subjects', 
    authMiddleware.verifyToken, 
    authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
    validators.validateObjectId('id'), 
    validators.validateSubjectAssignment, 
    courseController.addSubject
  );
  router.delete('/:id/subjects/:subjectId', 
    authMiddleware.verifyToken, 
    authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
    validators.validateObjectId('id'), 
    validators.validateObjectId('subjectId'), 
    courseController.removeSubject
  );
  
  export default router;