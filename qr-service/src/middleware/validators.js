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
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${paramName} format` });
    }
    
    next();
  };
};

// QR code generation validation schemas
const generateQRSchema = Joi.object({
  type: Joi.string().valid('attendance', 'access', 'information', 'verification').required(),
  payload: Joi.object().required(),
  expiryTime: Joi.alternatives().try(
    Joi.number().integer().min(1000), // milliseconds
    Joi.date().min('now')
  ),
  maxUsage: Joi.number().integer().min(0),
  entityId: Joi.string().required()
});

const attendanceQRSchema = Joi.object({
  sessionId: Joi.string().required(),
  classId: Joi.string().required(),
  entityId: Joi.string(),
  expiryTime: Joi.number().integer().min(1000) // milliseconds
});

const accessQRSchema = Joi.object({
  userId: Joi.string().required(),
  locationId: Joi.string().required(),
  permissions: Joi.array().items(Joi.string()),
  expiryTime: Joi.alternatives().try(
    Joi.number().integer().min(1000), // milliseconds
    Joi.date().min('now')
  ),
  maxUsage: Joi.number().integer().min(1)
});

const infoQRSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string(),
  url: Joi.string().uri(),
  expiryTime: Joi.alternatives().try(
    Joi.number().integer().min(1000), // milliseconds
    Joi.date().min('now')
  ),
  maxUsage: Joi.number().integer().min(0),
  entityId: Joi.string()
});

// QR code validation schemas
const qrValidationSchema = Joi.object({
  value: Joi.string().required()
});

const attendanceValidationSchema = Joi.object({
  value: Joi.string().required(),
  studentId: Joi.string().required(),
  biometricToken: Joi.string(),
  deviceInfo: Joi.object({
    device: Joi.string(),
    ipAddress: Joi.string()
  })
});

const accessValidationSchema = Joi.object({
  value: Joi.string().required(),
  locationId: Joi.string().required(),
  requiredPermissions: Joi.array().items(Joi.string()),
  deviceInfo: Joi.object({
    device: Joi.string(),
    ipAddress: Joi.string()
  })
});

export default {
  validateGenerateQR: validate(generateQRSchema),
  validateAttendanceQR: validate(attendanceQRSchema),
  validateAccessQR: validate(accessQRSchema),
  validateInfoQR: validate(infoQRSchema),
  validateQRValidation: validate(qrValidationSchema),
  validateAttendanceValidation: validate(attendanceValidationSchema),
  validateAccessValidation: validate(accessValidationSchema),
  validateObjectId
};