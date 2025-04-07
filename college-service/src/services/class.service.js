import Class from '../models/class.model.js';
import logger from '../utils/logger.js';

// Get all classes with pagination and filtering
const getAllClasses = async (page, limit, filter = {}, search = null) => {
  try {
    const skip = (page - 1) * limit;
    
    let query = Class.find(filter);
    
    // Add search functionality if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.or([
        { name: { $regex: searchRegex } },
        { code: { $regex: searchRegex } }
      ]);
    }
    
    // Get classes with pagination
    const classes = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .populate('subjectId', 'name code')
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await Class.countDocuments(
      search ? query.getFilter() : filter
    );
    
    return {
      classes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all classes service error:', error);
    throw error;
  }
};

// Get class by ID
const getClassById = async (id) => {
  try {
    return await Class.findById(id)
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .populate('subjectId', 'name code')
      .select('-__v')
      .lean();
  } catch (error) {
    logger.error('Get class by ID service error:', error);
    throw error;
  }
};

// Create a new class
const createClass = async (classData) => {
  try {
    // Create new class
    const classEntity = new Class(classData);
    await classEntity.save();
    
    // Return populated class
    return await getClassById(classEntity._id);
  } catch (error) {
    logger.error('Create class service error:', error);
    throw error;
  }
};

// Update class
const updateClass = async (id, updateData) => {
  try {
    await Class.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true }
    );
    
    // Return updated class with populated fields
    return await getClassById(id);
  } catch (error) {
    logger.error('Update class service error:', error);
    throw error;
  }
};

// Delete class
const deleteClass = async (id) => {
  try {
    const result = await Class.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete class service error:', error);
    throw error;
  }
};

// Enroll students in a class
const enrollStudents = async (id, studentIds, updatedBy) => {
  try {
    const classEntity = await Class.findById(id);
    
    if (!classEntity) {
      return null;
    }
    
    // Add students that are not already enrolled
    const existingStudents = new Set(classEntity.enrolledStudents.map(id => id.toString()));
    const studentsToAdd = studentIds.filter(id => !existingStudents.has(id));
    
    if (studentsToAdd.length > 0) {
      classEntity.enrolledStudents = [...classEntity.enrolledStudents, ...studentsToAdd];
      classEntity.updatedBy = updatedBy;
      
      await classEntity.save();
    }
    
    // Return updated class with populated fields
    return await getClassById(id);
  } catch (error) {
    logger.error('Enroll students service error:', error);
    throw error;
  }
};

// Remove students from a class
const removeStudents = async (id, studentIds, updatedBy) => {
  try {
    const classEntity = await Class.findById(id);
    
    if (!classEntity) {
      return null;
    }
    
    // Remove specified students
    classEntity.enrolledStudents = classEntity.enrolledStudents.filter(
      studentId => !studentIds.includes(studentId.toString())
    );
    classEntity.updatedBy = updatedBy;
    
    await classEntity.save();
    
    // Return updated class with populated fields
    return await getClassById(id);
  } catch (error) {
    logger.error('Remove students service error:', error);
    throw error;
  }
};

export default {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  enrollStudents,
  removeStudents
};