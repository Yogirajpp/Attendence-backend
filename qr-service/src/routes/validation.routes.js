import express from 'express';
import validationController from '../controllers/validation.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'validation-routes' });
});

// Validate QR code - requires auth
router.post('/validate', 
  authMiddleware.verifyToken, 
  validators.validateQRValidation, 
  validationController.validateQRCode
);

// Validate attendance QR code - requires auth
router.post('/attendance', 
  authMiddleware.verifyToken, 
  validators.validateAttendanceValidation, 
  validationController.validateAttendanceQR
);

// Validate access QR code - requires auth
router.post('/access', 
  authMiddleware.verifyToken, 
  validators.validateAccessValidation, 
  validationController.validateAccessQR
);

// Get info from QR code - public endpoint
router.get('/info/:value', 
  validationController.getInfoFromQR
);

// Check QR validity - public endpoint
router.get('/check', 
  validationController.checkQRValidity
);

export default router;