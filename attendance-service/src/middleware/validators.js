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

// Attendance validation schemas
const markAttendanceSchema = Joi.object({
  sessionId: Joi.string().required(),
  studentId: Joi.string().required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused'),
  qrToken: Joi.string(),
  biometricToken: Joi.string(),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    accuracy: Joi.number()
  }),
  remarks: Joi.string()
});

const updateAttendanceSchema = Joi.object({
  status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  remarks: Joi.string()
});

const bulkAttendanceSchema = Joi.object({
  sessionId: Joi.string().required(),
  attendanceData: Joi.array().items(
    Joi.object({
      studentId: Joi.string().required(),
      status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
      remarks: Joi.string()
    })
  ).min(1).required()
});

// Session validation schemas
const createSessionSchema = Joi.object({
  classId: Joi.string().required(),
  date: Joi.date().required(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  teacherId: Joi.string().required(),
  courseId: Joi.string().required(),
  subjectId: Joi.string().required(),
  collegeId: Joi.string().required(),
  departmentId: Joi.string().required(),
  semester: Joi.number().integer().min(1).required(),
  year: Joi.number().integer().required(),
  batch: Joi.string().required(),
  room: Joi.string(),
  topic: Joi.string(),
  description: Joi.string(),
  attendanceWindow: Joi.object({
    openTime: Joi.date().required(),
    closeTime: Joi.date().required()
  }),
  expectedStudents: Joi.array().items(Joi.string()).min(1).required()
});

const updateSessionSchema = Joi.object({
  date: Joi.date(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  room: Joi.string(),
  topic: Joi.string(),
  description: Joi.string(),
  attendanceWindow: Joi.object({
    openTime: Joi.date().required(),
    closeTime: Joi.date().required()
  }),
  status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled'),
  expectedStudents: Joi.array().items(Joi.string()).min(1)
}).min(1);

const cancelSessionSchema = Joi.object({
  reason: Joi.string()
});

export default {
  validateMarkAttendance: validate(markAttendanceSchema),
  validateUpdateAttendance: validate(updateAttendanceSchema),
  validateBulkAttendance: validate(bulkAttendanceSchema),
  validateCreateSession: validate(createSessionSchema),
  validateUpdateSession: validate(updateSessionSchema),
  validateCancelSession: validate(cancelSessionSchema),
  validateObjectId
};