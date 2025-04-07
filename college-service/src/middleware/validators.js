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

// College validation schemas
const createCollegeSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default('India')
  }).required(),
  contacts: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      designation: Joi.string().required()
    })
  ),
  website: Joi.string().uri(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  logo: Joi.string(),
  description: Joi.string(),
  establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  accreditation: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      year: Joi.number().integer().required(),
      grade: Joi.string().required(),
      validUntil: Joi.date()
    })
  ),
  companyId: Joi.string().required(),
  isActive: Joi.boolean()
});

const updateCollegeSchema = Joi.object({
  name: Joi.string(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default('India')
  }),
  contacts: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      designation: Joi.string().required()
    })
  ),
  website: Joi.string().uri(),
  email: Joi.string().email(),
  phone: Joi.string(),
  description: Joi.string(),
  establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  accreditation: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      year: Joi.number().integer().required(),
      grade: Joi.string().required(),
      validUntil: Joi.date()
    })
  ),
  isActive: Joi.boolean()
}).min(1);

// Department validation schemas
const createDepartmentSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  collegeId: Joi.string().required(),
  description: Joi.string(),
  headOfDepartment: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    userId: Joi.string()
  }),
  establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  isActive: Joi.boolean()
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  headOfDepartment: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    userId: Joi.string()
  }),
  establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  isActive: Joi.boolean()
}).min(1);

const headOfDepartmentSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  userId: Joi.string().required()
});

// Course validation schemas
const createCourseSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  collegeId: Joi.string().required(),
  departmentId: Joi.string().required(),
  description: Joi.string(),
  duration: Joi.object({
    years: Joi.number().integer().min(1).required(),
    semesters: Joi.number().integer().min(1).required()
  }).required(),
  type: Joi.string().valid('undergraduate', 'postgraduate', 'diploma', 'certificate', 'phd').required(),
  degree: Joi.string().required(),
  syllabus: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string(),
      units: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          topics: Joi.array().items(Joi.string()).required()
        })
      )
    })
  ),
  subjects: Joi.array().items(Joi.string()),
  isActive: Joi.boolean()
});

const updateCourseSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  duration: Joi.object({
    years: Joi.number().integer().min(1).required(),
    semesters: Joi.number().integer().min(1).required()
  }),
  type: Joi.string().valid('undergraduate', 'postgraduate', 'diploma', 'certificate', 'phd'),
  degree: Joi.string(),
  isActive: Joi.boolean()
}).min(1);

const syllabusItemSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  units: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      topics: Joi.array().items(Joi.string()).required()
    })
  )
});

const subjectAssignmentSchema = Joi.object({
  subjectId: Joi.string().required()
});

// Class validation schemas
const createClassSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  courseId: Joi.string().required(),
  departmentId: Joi.string().required(),
  collegeId: Joi.string().required(),
  subjectId: Joi.string().required(),
  teacherId: Joi.string().required(),
  schedule: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    dayOfWeek: Joi.array().items(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ).min(1).required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    room: Joi.string().required()
  }).required(),
  semester: Joi.number().integer().min(1).required(),
  year: Joi.number().integer().required(),
  batch: Joi.string().required(),
  section: Joi.string(),
  maxStudents: Joi.number().integer().min(1),
  enrolledStudents: Joi.array().items(Joi.string()),
  isActive: Joi.boolean()
});

const updateClassSchema = Joi.object({
  name: Joi.string(),
  teacherId: Joi.string(),
  schedule: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    dayOfWeek: Joi.array().items(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ).min(1).required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    room: Joi.string().required()
  }),
  maxStudents: Joi.number().integer().min(1),
  isActive: Joi.boolean()
}).min(1);

const studentEnrollmentSchema = Joi.object({
  studentIds: Joi.array().items(Joi.string()).min(1).required()
});

export default {
  validateCreateCollege: validate(createCollegeSchema),
  validateUpdateCollege: validate(updateCollegeSchema),
  validateCreateDepartment: validate(createDepartmentSchema),
  validateUpdateDepartment: validate(updateDepartmentSchema),
  validateHeadOfDepartment: validate(headOfDepartmentSchema),
  validateCreateCourse: validate(createCourseSchema),
  validateUpdateCourse: validate(updateCourseSchema),
  validateSyllabusItem: validate(syllabusItemSchema),
  validateSubjectAssignment: validate(subjectAssignmentSchema),
  validateCreateClass: validate(createClassSchema),
  validateUpdateClass: validate(updateClassSchema),
  validateStudentEnrollment: validate(studentEnrollmentSchema),
  validateObjectId
};