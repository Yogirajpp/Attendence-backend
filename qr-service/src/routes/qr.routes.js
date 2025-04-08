import express from 'express';
import qrController from '../controllers/qr.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'qr-routes' });
});

// Protected routes
router.post('/', 
  authMiddleware.verifyToken, 
  validators.validateGenerateQR, 
  qrController.generateQRCode
);

router.post('/attendance', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['teacher', 'college_admin', 'admin']), 
  validators.validateAttendanceQR, 
  qrController.generateAttendanceQR
);

router.post('/access', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin', 'college_admin']), 
  validators.validateAccessQR, 
  qrController.generateAccessQR
);

router.post('/info', 
  authMiddleware.verifyToken, 
  validators.validateInfoQR, 
  qrController.generateInfoQR
);

router.get('/:id', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('id'), 
  qrController.getQRCodeDetails
);

router.delete('/:id', 
  authMiddleware.verifyToken, 
  validators.validateObjectId('id'), 
  qrController.deactivateQRCode
);

router.get('/', 
  authMiddleware.verifyToken, 
  qrController.getQRCodes
);

router.get('/:id/image', 
  validators.validateObjectId('id'), 
  qrController.getQRImage
);

router.post('/cleanup', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole(['admin']), 
  qrController.cleanupExpiredQRCodes
);

export default router;