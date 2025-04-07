import Student from '../models/student.model.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

// Get all students with pagination and filtering
const getAllStudents = async (page, limit, filter = {}, search = null) => {
  try {
    const skip = (page - 1) * limit;
    
    let students;
    let total;
    
    // If search is provided, we need to search in the User collection as well
    if (search) {
      // Find user profiles that match the search
      const userSearchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: userSearchRegex } },
          { email: { $regex: userSearchRegex } }
        ],
        role: 'student'
      }).select('_id').lean();
      
      const userProfileIds = matchingUsers.map(user => user._id);
      
      // Add userProfileIds to the filter
      const searchFilter = {
        ...filter,
        userProfileId: { $in: userProfileIds }
      };
      
      // Get students with pagination
      students = await Student.find(searchFilter)
        .skip(skip)
        .limit(limit)
        .populate('userProfileId', '-__v')
        .populate('collegeId', 'name code')
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code')
        .select('-__v')
        .lean();
      
      // Get total count for pagination
      total = await Student.countDocuments(searchFilter);
    } else {
      // Standard filter without search
      students = await Student.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('userProfileId', '-__v')
        .populate('collegeId', 'name code')
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code')
        .select('-__v')
        .lean();
      
      // Get total count for pagination
      total = await Student.countDocuments(filter);
    }
    
    return {
      students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all students service error:', error);
    throw error;
  }
};

// Get student by ID
const getStudentById = async (id) => {
  try {
    return await Student.findById(id)
      .populate('userProfileId', '-__v')
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .select('-__v')
      .lean();
  } catch (error) {
    logger.error('Get student by ID service error:', error);
    throw error;
  }
};

// Get student by User ID from Auth service
const getStudentByUserId = async (userId) => {
  try {
    return await Student.findOne({ userId })
      .populate('userProfileId', '-__v')
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .select('-__v')
      .lean();
  } catch (error) {
    logger.error('Get student by User ID service error:', error);
    throw error;
  }
};

// Create a new student
const createStudent = async (studentData) => {
  try {
    // Create new student
    const student = new Student(studentData);
    await student.save();
    
    return await getStudentById(student._id);
  } catch (error) {
    logger.error('Create student service error:', error);
    throw error;
  }
};

// Update student
const updateStudent = async (id, updateData) => {
  try {
    await Student.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true }
    );
    
    return await getStudentById(id);
  } catch (error) {
    logger.error('Update student service error:', error);
    throw error;
  }
};

// Delete student
const deleteStudent = async (id) => {
  try {
    const result = await Student.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete student service error:', error);
    throw error;
  }
};

// Get students by criteria
const getStudentsByCriteria = async (criteria, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get students with pagination
    const students = await Student.find(criteria)
      .skip(skip)
      .limit(limit)
      .populate('userProfileId', '-__v')
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await Student.countDocuments(criteria);
    
    return {
      students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get students by criteria service error:', error);
    throw error;
  }
};

// Get students by course
const getStudentsByCourse = async (courseId, page = 1, limit = 10, filter = {}) => {
  try {
    // Combine courseId with additional filters
    const combinedFilter = {
      ...filter,
      courseId
    };
    
    return await getStudentsByCriteria(combinedFilter, page, limit);
  } catch (error) {
    logger.error('Get students by course service error:', error);
    throw error;
  }
};

// Get students by department
const getStudentsByDepartment = async (departmentId, page = 1, limit = 10, filter = {}) => {
  try {
    // Combine departmentId with additional filters
    const combinedFilter = {
      ...filter,
      departmentId
    };
    
    return await getStudentsByCriteria(combinedFilter, page, limit);
  } catch (error) {
    logger.error('Get students by department service error:', error);
    throw error;
  }
};

// Get students by college
const getStudentsByCollege = async (collegeId, page = 1, limit = 10, filter = {}) => {
  try {
    // Combine collegeId with additional filters
    const combinedFilter = {
      ...filter,
      collegeId
    };
    
    return await getStudentsByCriteria(combinedFilter, page, limit);
  } catch (error) {
    logger.error('Get students by college service error:', error);
    throw error;
  }
};

// Get student IDs by criteria (used by other services)
const getStudentIdsByCriteria = async (criteria) => {
  try {
    const students = await Student.find(criteria).select('_id').lean();
    return students.map(student => student._id);
  } catch (error) {
    logger.error('Get student IDs by criteria service error:', error);
    throw error;
  }
};

export default {
  getAllStudents,
  getStudentById,
  getStudentByUserId,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByCriteria,
  getStudentsByCourse,
  getStudentsByDepartment,
  getStudentsByCollege,
  getStudentIdsByCriteria
};