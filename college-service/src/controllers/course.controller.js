import courseService from '../services/course.service.js';
import logger from '../utils/logger.js';

// Get all courses with pagination and filtering
const getAllCourses = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      collegeId, 
      departmentId, 
      type, 
      search, 
      isActive 
    } = req.query;
    
    // Create filter object
    const filter = {};
    if (collegeId) filter.collegeId = collegeId;
    if (departmentId) filter.departmentId = departmentId;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const courses = await courseService.getAllCourses(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter,
      search
    );
    
    return res.status(200).json(courses);
  } catch (error) {
    logger.error('Get all courses error:', error);
    next(error);
  }
};

// Get course by ID
const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const course = await courseService.getCourseById(id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    return res.status(200).json({ course });
  } catch (error) {
    logger.error('Get course by ID error:', error);
    next(error);
  }
};

// Create a new course
const createCourse = async (req, res, next) => {
  try {
    // Add creator info from authenticated user
    const courseData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const course = await courseService.createCourse(courseData);
    
    return res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    logger.error('Create course error:', error);
    next(error);
  }
};

// Update course
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Add updater info from authenticated user
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const updatedCourse = await courseService.updateCourse(id, updateData);
    
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    return res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    logger.error('Update course error:', error);
    next(error);
  }
};

// Delete course
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await courseService.deleteCourse(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    return res.status(200).json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    logger.error('Delete course error:', error);
    next(error);
  }
};

// Get courses by department
const getCoursesByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { page = 1, limit = 10, type, isActive } = req.query;
    
    // Create filter object
    const filter = { departmentId };
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const courses = await courseService.getAllCourses(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(courses);
  } catch (error) {
    logger.error('Get courses by department error:', error);
    next(error);
  }
};

// Get courses by college
const getCoursesByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const { page = 1, limit = 10, departmentId, type, isActive } = req.query;
    
    // Create filter object
    const filter = { collegeId };
    if (departmentId) filter.departmentId = departmentId;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const courses = await courseService.getAllCourses(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(courses);
  } catch (error) {
    logger.error('Get courses by college error:', error);
    next(error);
  }
};

// Add syllabus item to course
const addSyllabusItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const syllabusItem = req.body;
    
    const updatedCourse = await courseService.addSyllabusItem(id, syllabusItem, req.user.id);
    
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    return res.status(200).json({
      message: 'Syllabus item added successfully',
      course: updatedCourse
    });
  } catch (error) {
    logger.error('Add syllabus item error:', error);
    next(error);
  }
};

// Remove syllabus item from course
const removeSyllabusItem = async (req, res, next) => {
  try {
    const { id, syllabusItemId } = req.params;
    
    const updatedCourse = await courseService.removeSyllabusItem(id, syllabusItemId, req.user.id);
    
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course or syllabus item not found' });
    }
    
    return res.status(200).json({
      message: 'Syllabus item removed successfully',
      course: updatedCourse
    });
  } catch (error) {
    logger.error('Remove syllabus item error:', error);
    next(error);
  }
};

// Add subject to course
const addSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectId } = req.body;
    
    if (!subjectId) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }
    
    const updatedCourse = await courseService.addSubject(id, subjectId, req.user.id);
    
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    return res.status(200).json({
      message: 'Subject added to course successfully',
      course: updatedCourse
    });
  } catch (error) {
    logger.error('Add subject error:', error);
    next(error);
  }
};

// Remove subject from course
const removeSubject = async (req, res, next) => {
  try {
    const { id, subjectId } = req.params;
    
    const updatedCourse = await courseService.removeSubject(id, subjectId, req.user.id);
    
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course or subject not found' });
    }
    
    return res.status(200).json({
      message: 'Subject removed from course successfully',
      course: updatedCourse
    });
  } catch (error) {
    logger.error('Remove subject error:', error);
    next(error);
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByDepartment,
  getCoursesByCollege,
  addSyllabusItem,
  removeSyllabusItem,
  addSubject,
  removeSubject
};