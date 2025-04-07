import express from 'express';
import collegeController from '../controllers/college.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'college-routes' });
});

// Protected routes with different access levels
router.get('/', authMiddleware.verifyToken, collegeController.getAllColleges);
router.get('/:id', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('id'), 
  collegeController.getCollegeById
);

// Routes requiring admin or company admin access
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin']), 
  validators.validateCreateCollege, 
  collegeController.createCollege
);
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateCollege, 
  collegeController.updateCollege
);
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin']), 
  validators.validateObjectId('id'), 
  collegeController.deleteCollege
);

// Route for uploading college logo
router.post('/:id/logo', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  // File upload middleware would be added here
  collegeController.uploadCollegeLogo
);

// Route for getting colleges by company
router.get('/company/:companyId', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('companyId'), 
  collegeController.getCollegesByCompany
);

export default router;