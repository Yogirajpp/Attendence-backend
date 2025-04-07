import express from 'express';
import departmentController from '../controllers/department.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'department-routes' });
});

// Protected routes with different access levels
router.get('/', authMiddleware.verifyToken, departmentController.getAllDepartments);
router.get('/:id', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('id'), 
  departmentController.getDepartmentById
);

// Routes requiring admin or college admin access
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateCreateDepartment, 
  departmentController.createDepartment
);
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateDepartment, 
  departmentController.updateDepartment
);
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  departmentController.deleteDepartment
);

// Route for getting departments by college
router.get('/college/:collegeId', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('collegeId'), 
  departmentController.getDepartmentsByCollege
);

// Route for assigning head of department
router.post('/:id/head', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateHeadOfDepartment, 
  departmentController.assignHeadOfDepartment
);

export default router;