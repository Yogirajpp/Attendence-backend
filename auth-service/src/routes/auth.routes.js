import express from 'express';
import authController from '../controllers/auth.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validators.validateRegistration, authController.register);
router.post('/login', validators.validateLogin, authController.login);
router.post('/refresh-token', validators.validateRefreshToken, authController.refreshToken);
router.post('/forgot-password', validators.validateEmail, authController.forgotPassword);
router.post('/reset-password', validators.validateResetPassword, authController.resetPassword);

// Protected routes
router.post('/logout', authMiddleware.verifyToken, validators.validateRefreshToken, authController.logout);
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/profile', authMiddleware.verifyToken, validators.validateUpdateProfile, authController.updateProfile);
router.put('/change-password', authMiddleware.verifyToken, validators.validateChangePassword, authController.changePassword);

export default router;