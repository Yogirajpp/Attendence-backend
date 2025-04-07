import Teacher from '../models/teacher.model.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

// Get all teachers with pagination and filtering
const getAllTeachers = async (page, limit, filter = {}, search = null) => {
  try {
    const skip = (page - 1) * limit;
    
    let teachers;
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
        role: 'teacher'
      }).select('_id').lean();
      
      const userProfileIds = matchingUsers.map(user => user._id);
      
      // Add userProfileIds to the filter
      const searchFilter = {
        ...filter,
        userProfileId: { $in: userProfileIds }
      };
      
      // Get teachers with pagination
      teachers = await Teacher.find(searchFilter)
        .skip(skip)
        .limit(limit)
        .populate('userProfileId', '-__v')
        .populate('collegeId', 'name code')
        .populate('departmentId', 'name code')
        .populate('subjects', 'name code')
        .select('-__v')
        .lean();
      
      // Get total count for pagination
      total = await Teacher.countDocuments(searchFilter);
    } else {
      // Standard filter without search
      teachers = await Teacher.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('userProfileId', '-__v')
        .populate('collegeId', 'name code')
        .populate('departmentId', 'name code')
        .populate('subjects', 'name code')
        .select('-__v')
        .lean();
      
      // Get total count for pagination
      total = await Teacher.countDocuments(filter);
    }
    
    return {
      teachers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all teachers service error:', error);
    throw error;
  }
};

// Get teacher by ID
const getTeacherById = async (id) => {
  try {
    return await Teacher.findById(id)
      .populate('userProfileId', '-__v')
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('subjects', 'name code')
      .select('-__v')
      .lean();
  } catch (error) {
    logger.error('Get teacher by ID service error:', error);
    throw error;
  }
};

// Get teacher by User ID from Auth service
const getTeacherByUserId = async (userId) => {
  try {
    return await Teacher.findOne({ userId })
      .populate('userProfileId', '-__v')
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('subjects', 'name code')
      .select('-__v')
      .lean();
  } catch (error) {
    logger.error('Get teacher by User ID service error:', error);
    throw error;
  }
};

// Create a new teacher
const createTeacher = async (teacherData) => {
  try {
    // Create new teacher
    const teacher = new Teacher(teacherData);
    await teacher.save();
    
    return await getTeacherById(teacher._id);
  } catch (error) {
    logger.error('Create teacher service error:', error);
    throw error;
  }
};

// Update teacher
const updateTeacher = async (id, updateData) => {
  try {
    await Teacher.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true }
    );
    
    return await getTeacherById(id);
  } catch (error) {
    logger.error('Update teacher service error:', error);
    throw error;
  }
};

// Delete teacher
const deleteTeacher = async (id) => {
  try {
    const result = await Teacher.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete teacher service error:', error);
    throw error;
  }
};

// Assign subjects to a teacher
const assignSubjects = async (id, subjectIds) => {
  try {
    // Get current teacher
    const teacher = await Teacher.findById(id);
    if (!teacher) return null;
    
    // Add new subjects (avoiding duplicates)
    const currentSubjects = teacher.subjects.map(s => s.toString());
    const subjectsToAdd = subjectIds.filter(s => !currentSubjects.includes(s));
    
    if (subjectsToAdd.length === 0) {
      return await getTeacherById(id);
    }
    
    // Update teacher with new subjects
    teacher.subjects = [...teacher.subjects, ...subjectsToAdd];
    await teacher.save();
    
    return await getTeacherById(id);
  } catch (error) {
    logger.error('Assign subjects service error:', error);
    throw error;
  }
};

// Remove subjects from a teacher
const removeSubjects = async (id, subjectIds) => {
  try {
    // Get current teacher
    const teacher = await Teacher.findById(id);
    if (!teacher) return null;
    
    // Filter out subjects to remove
    teacher.subjects = teacher.subjects.filter(subject => 
      !subjectIds.includes(subject.toString())
    );
    
    await teacher.save();
    
    return await getTeacherById(id);
  } catch (error) {
    logger.error('Remove subjects service error:', error);
    throw error;
  }
};

// Get teachers by criteria
const getTeachersByCriteria = async (criteria, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get teachers with pagination
    const teachers = await Teacher.find(criteria)
      .skip(skip)
      .limit(limit)
      .populate('userProfileId', '-__v')
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('subjects', 'name code')
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await Teacher.countDocuments(criteria);
    
    return {
      teachers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get teachers by criteria service error:', error);
    throw error;
  }
};

// Get teachers by subject
const getTeachersBySubject = async (subjectId, page = 1, limit = 10, filter = {}) => {
  try {
    // Combine subjectId with additional filters
    const combinedFilter = {
      ...filter,
      subjects: subjectId
    };
    
    return await getTeachersByCriteria(combinedFilter, page, limit);
  } catch (error) {
    logger.error('Get teachers by subject service error:', error);
    throw error;
  }
};

// Get teachers by department
const getTeachersByDepartment = async (departmentId, page = 1, limit = 10, filter = {}) => {
  try {
    // Combine departmentId with additional filters
    const combinedFilter = {
      ...filter,
      departmentId
    };
    
    return await getTeachersByCriteria(combinedFilter, page, limit);
  } catch (error) {
    logger.error('Get teachers by department service error:', error);
    throw error;
  }
};

// Get teachers by college
const getTeachersByCollege = async (collegeId, page = 1, limit = 10, filter = {}) => {
  try {
    // Combine collegeId with additional filters
    const combinedFilter = {
      ...filter,
      collegeId
    };
    
    return await getTeachersByCriteria(combinedFilter, page, limit);
  } catch (error) {
    logger.error('Get teachers by college service error:', error);
    throw error;
  }
};

// Get teacher IDs by criteria (used by other services)
const getTeacherIdsByCriteria = async (criteria) => {
  try {
    const teachers = await Teacher.find(criteria).select('_id').lean();
    return teachers.map(teacher => teacher._id);
  } catch (error) {
    logger.error('Get teacher IDs by criteria service error:', error);
    throw error;
  }
};

export default {
  getAllTeachers,
  getTeacherById,
  getTeacherByUserId,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignSubjects,
  removeSubjects,
  getTeachersByCriteria,
  getTeachersBySubject,
  getTeachersByDepartment,
  getTeachersByCollege,
  getTeacherIdsByCriteria
};