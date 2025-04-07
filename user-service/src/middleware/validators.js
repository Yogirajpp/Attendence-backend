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

// User validation schemas
const createUserSchema = Joi.object({
  userId: Joi.string().required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  phone: Joi.string(),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
    country: Joi.string()
  }),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say'),
  profilePicture: Joi.string(),
  role: Joi.string().valid('student', 'teacher', 'college_admin', 'company_admin', 'admin').required(),
  collegeId: Joi.string().when('role', {
    is: Joi.string().valid('student', 'teacher', 'college_admin'),
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  companyId: Joi.string().when('role', {
    is: 'company_admin',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  isActive: Joi.boolean()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2),
  phone: Joi.string(),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
    country: Joi.string()
  }),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say'),
  profilePicture: Joi.string(),
  isActive: Joi.boolean()
}).min(1);

// User profile update schema (more restricted)
const updateUserProfileSchema = Joi.object({
    name: Joi.string().min(2),
    phone: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    }),
    dateOfBirth: Joi.date(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say')
  }).min(1);
  
  // Student validation schemas
  const createStudentSchema = Joi.object({
    userId: Joi.string().required(),
    userProfileId: Joi.string().required(),
    enrollmentNumber: Joi.string().required(),
    collegeId: Joi.string().required(),
    departmentId: Joi.string().required(),
    courseId: Joi.string().required(),
    batch: Joi.string().required(),
    semester: Joi.number().integer().min(1).required(),
    year: Joi.number().integer().required(),
    section: Joi.string(),
    enrollmentDate: Joi.date(),
    guardianName: Joi.string(),
    guardianContact: Joi.string(),
    isActive: Joi.boolean()
  });
  
  const updateStudentSchema = Joi.object({
    semester: Joi.number().integer().min(1),
    year: Joi.number().integer(),
    section: Joi.string(),
    guardianName: Joi.string(),
    guardianContact: Joi.string(),
    isActive: Joi.boolean()
  }).min(1);
  
  // Teacher validation schemas
  const createTeacherSchema = Joi.object({
    userId: Joi.string().required(),
    userProfileId: Joi.string().required(),
    employeeId: Joi.string().required(),
    collegeId: Joi.string().required(),
    departmentId: Joi.string().required(),
    position: Joi.string().required(),
    joiningDate: Joi.date().required(),
    subjects: Joi.array().items(Joi.string()),
    qualifications: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().integer().required(),
        specialization: Joi.string()
      })
    ),
    experience: Joi.array().items(
      Joi.object({
        organization: Joi.string().required(),
        position: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date(),
        description: Joi.string()
      })
    ),
    isActive: Joi.boolean()
  });
  
  const updateTeacherSchema = Joi.object({
    position: Joi.string(),
    qualifications: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().integer().required(),
        specialization: Joi.string()
      })
    ),
    experience: Joi.array().items(
      Joi.object({
        organization: Joi.string().required(),
        position: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date(),
        description: Joi.string()
      })
    ),
    isActive: Joi.boolean()
  }).min(1);
  
  // Subject assignment validation schema
  const subjectAssignmentSchema = Joi.object({
    subjects: Joi.array().items(Joi.string()).min(1).required()
  });
  
  export default {
    validateCreateUser: validate(createUserSchema),
    validateUpdateUser: validate(updateUserSchema),
    validateUpdateUserProfile: validate(updateUserProfileSchema),
    validateCreateStudent: validate(createStudentSchema),
    validateUpdateStudent: validate(updateStudentSchema),
    validateCreateTeacher: validate(createTeacherSchema),
    validateUpdateTeacher: validate(updateTeacherSchema),
    validateSubjectAssignment: validate(subjectAssignmentSchema),
    validateObjectId
  };