import express from 'express';
import roleController from '../controllers/role.controller.js';
import validators from '../middleware/validators.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.use(authMiddleware.verifyToken, authMiddleware.checkRole(['admin']));

router.post('/', validators.validateRole, roleController.createRole);
router.get('/', roleController.getAllRoles);
router.get('/:id', validators.validateObjectId, roleController.getRoleById);
router.put('/:id', validators.validateObjectId, validators.validateRole, roleController.updateRole);
router.delete('/:id', validators.validateObjectId, roleController.deleteRole);

export default router;