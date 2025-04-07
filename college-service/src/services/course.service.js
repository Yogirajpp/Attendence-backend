import Course from '../models/course.model.js';
import logger from '../utils/logger.js';

// Get all courses with pagination and filtering
const getAllCourses = async (page, limit, filter = {}, search = null) => {
  try {
    const skip = (page - 1) * limit;
    
    let query = Course.find(filter);
    
    // Add search functionality if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.or([
        { name: { $regex: searchRegex } },
        { code: { $regex: searchRegex } }
      ]);
    }
    
    // Get courses with pagination
    const courses = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('subjects', 'name code')
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await Course.countDocuments(
      search ? query.getFilter() : filter
    );
    
    return {
      courses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all courses service error:', error);
    throw error;
  }
};

// Get course by ID
const getCourseById = async (id) => {
  try {
    return await Course.findById(id)
      .populate('collegeId', 'name code')
      .populate('departmentId', 'name code')
      .populate('subjects', 'name code')
      .select('-__v')
      .lean();
  } catch (error) {
    logger.error('Get course by ID service error:', error);
    throw error;
  }
};

// Create a new course
const createCourse = async (courseData) => {
  try {
    // Create new course
    const course = new Course(courseData);
    await course.save();
    
    // Return populated course
    return await getCourseById(course._id);
  } catch (error) {
    logger.error('Create course service error:', error);
    throw error;
  }
};

// Update course
const updateCourse = async (id, updateData) => {
  try {
    await Course.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true }
    );
    
    // Return updated course with populated fields
    return await getCourseById(id);
  } catch (error) {
    logger.error('Update course service error:', error);
    throw error;
  }
};

// Delete course
const deleteCourse = async (id) => {
  try {
    const result = await Course.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete course service error:', error);
    throw error;
  }
};

// Add syllabus item to course
const addSyllabusItem = async (id, syllabusItem, updatedBy) => {
  try {
    const course = await Course.findById(id);
    
    if (!course) {
      return null;
    }
    
    course.syllabus.push(syllabusItem);
    course.updatedBy = updatedBy;
    
    await course.save();
    
    // Return updated course with populated fields
    return await getCourseById(id);
  } catch (error) {
    logger.error('Add syllabus item service error:', error);
    throw error;
  }
};

// Remove syllabus item from course
const removeSyllabusItem = async (id, syllabusItemId, updatedBy) => {
  try {
    const course = await Course.findById(id);
    
    if (!course) {
      return null;
    }
    
    // Find the syllabus item index
    const itemIndex = course.syllabus.findIndex(
      item => item._id.toString() === syllabusItemId
    );
    
    if (itemIndex === -1) {
      return null;
    }
    
    // Remove the item
    course.syllabus.splice(itemIndex, 1);
    course.updatedBy = updatedBy;
    
    await course.save();
    
    // Return updated course with populated fields
    return await getCourseById(id);
  } catch (error) {
    logger.error('Remove syllabus item service error:', error);
    throw error;
  }
};

// Add subject to course
const addSubject = async (id, subjectId, updatedBy) => {
  try {
    const course = await Course.findById(id);
    
    if (!course) {
      return null;
    }
    
    // Check if subject already exists
    if (course.subjects.includes(subjectId)) {
      return await getCourseById(id);
    }
    
    // Add the subject
    course.subjects.push(subjectId);
    course.updatedBy = updatedBy;
    
    await course.save();
    
    // Return updated course with populated fields
    return await getCourseById(id);
  } catch (error) {
    logger.error('Add subject service error:', error);
    throw error;
  }
};

// Remove subject from course
const removeSubject = async (id, subjectId, updatedBy) => {
  try {
    const course = await Course.findById(id);
    
    if (!course) {
      return null;
    }
    
    // Find the subject index
    const subjectIndex = course.subjects.findIndex(
      subject => subject.toString() === subjectId
    );
    
    if (subjectIndex === -1) {
      return null;
    }
    
    // Remove the subject
    course.subjects.splice(subjectIndex, 1);
    course.updatedBy = updatedBy;
    
    await course.save();
    
    // Return updated course with populated fields
    return await getCourseById(id);
  } catch (error) {
    logger.error('Remove subject service error:', error);
    throw error;
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addSyllabusItem,
  removeSyllabusItem,
  addSubject,
  removeSubject
};