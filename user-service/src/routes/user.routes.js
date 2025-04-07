import express from 'express';
import userController from '../controllers/user.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-routes' });
});

// Protected routes - General users
router.get('/profile', authMiddleware.verifyToken, userController.getUserProfile);
router.put('/profile', 
  authMiddleware.verifyToken, 
  validators.validateUpdateUserProfile, 
  userController.updateUserProfile
);
router.post('/profile/picture', 
  authMiddleware.verifyToken,
  // File upload middleware would be added here
  userController.uploadProfilePicture
);

// Protected routes - Admins only
router.get('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  userController.getAllUsers
);
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateCreateUser, 
  userController.createUser
);
router.get('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  userController.getUserById
);
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'company_admin', 'college_admin']), 
  validators.validateObjectId('id'), 
  validators.validateUpdateUser, 
  userController.updateUser
);
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin']), 
  validators.validateObjectId('id'), 
  userController.deleteUser
);

export default router;