import Joi from 'joi';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Helper function to validate requests
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  next();
};

// Registration validation schema
const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('student', 'teacher', 'college_admin', 'company_admin', 'admin'),
  collegeId: Joi.string().when('role', {
    is: Joi.string().valid('student', 'teacher', 'college_admin'),
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  companyId: Joi.string().when('role', {
    is: 'company_admin',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Email validation schema
const emailSchema = Joi.object({
  email: Joi.string().email().required()
});

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Update profile validation schema
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().email()
}).min(1);

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Role validation schema
const roleSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().required(),
  permissions: Joi.array().items(
    Joi.object({
      resource: Joi.string().required(),
      actions: Joi.array().items(
        Joi.string().valid('create', 'read', 'update', 'delete')
      ).min(1).required()
    })
  ).min(1).required()
});

export default {
  validateRegistration: validate(registrationSchema),
  validateLogin: validate(loginSchema),
  validateEmail: validate(emailSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateUpdateProfile: validate(updateProfileSchema),
  validateChangePassword: validate(changePasswordSchema),
  validateRole: validate(roleSchema),
  validateObjectId
};