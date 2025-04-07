import classService from '../services/class.service.js';
import logger from '../utils/logger.js';

// Get all classes with pagination and filtering
const getAllClasses = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      collegeId,
      departmentId,
      courseId,
      subjectId,
      teacherId,
      semester,
      year,
      batch,
      search,
      isActive 
    } = req.query;
    
    // Create filter object
    const filter = {};
    if (collegeId) filter.collegeId = collegeId;
    if (departmentId) filter.departmentId = departmentId;
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (teacherId) filter.teacherId = teacherId;
    if (semester) filter.semester = parseInt(semester, 10);
    if (year) filter.year = parseInt(year, 10);
    if (batch) filter.batch = batch;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const classes = await classService.getAllClasses(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter,
      search
    );
    
    return res.status(200).json(classes);
  } catch (error) {
    logger.error('Get all classes error:', error);
    next(error);
  }
};

// Get class by ID
const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classEntity = await classService.getClassById(id);
    
    if (!classEntity) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    return res.status(200).json({ class: classEntity });
  } catch (error) {
    logger.error('Get class by ID error:', error);
    next(error);
  }
};

// Create a new class
const createClass = async (req, res, next) => {
  try {
    // Add creator info from authenticated user
    const classData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const classEntity = await classService.createClass(classData);
    
    return res.status(201).json({
      message: 'Class created successfully',
      class: classEntity
    });
  } catch (error) {
    logger.error('Create class error:', error);
    next(error);
  }
};

// Update class
const updateClass = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Add updater info from authenticated user
      const updateData = {
        ...req.body,
        updatedBy: req.user.id
      };
      
      const updatedClass = await classService.updateClass(id, updateData);
      
      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      return res.status(200).json({
        message: 'Class updated successfully',
        class: updatedClass
      });
    } catch (error) {
      logger.error('Update class error:', error);
      next(error);
    }
  };
  
  // Delete class
  const deleteClass = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const result = await classService.deleteClass(id);
      
      if (!result) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      return res.status(200).json({
        message: 'Class deleted successfully'
      });
    } catch (error) {
      logger.error('Delete class error:', error);
      next(error);
    }
  };
  
  // Get classes by course
  const getClassesByCourse = async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        subjectId, 
        teacherId, 
        semester, 
        year, 
        batch, 
        isActive 
      } = req.query;
      
      // Create filter object
      const filter = { courseId };
      if (subjectId) filter.subjectId = subjectId;
      if (teacherId) filter.teacherId = teacherId;
      if (semester) filter.semester = parseInt(semester, 10);
      if (year) filter.year = parseInt(year, 10);
      if (batch) filter.batch = batch;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      const classes = await classService.getAllClasses(
        parseInt(page, 10),
        parseInt(limit, 10),
        filter
      );
      
      return res.status(200).json(classes);
    } catch (error) {
      logger.error('Get classes by course error:', error);
      next(error);
    }
  };
  
  // Get classes by teacher
  const getClassesByTeacher = async (req, res, next) => {
    try {
      const { teacherId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        courseId,
        subjectId,
        semester,
        year,
        batch, 
        isActive 
      } = req.query;
      
      // Create filter object
      const filter = { teacherId };
      if (courseId) filter.courseId = courseId;
      if (subjectId) filter.subjectId = subjectId;
      if (semester) filter.semester = parseInt(semester, 10);
      if (year) filter.year = parseInt(year, 10);
      if (batch) filter.batch = batch;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      const classes = await classService.getAllClasses(
        parseInt(page, 10),
        parseInt(limit, 10),
        filter
      );
      
      return res.status(200).json(classes);
    } catch (error) {
      logger.error('Get classes by teacher error:', error);
      next(error);
    }
  };
  
  // Get classes by subject
  const getClassesBySubject = async (req, res, next) => {
    try {
      const { subjectId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        courseId,
        teacherId,
        semester,
        year,
        batch, 
        isActive 
      } = req.query;
      
      // Create filter object
      const filter = { subjectId };
      if (courseId) filter.courseId = courseId;
      if (teacherId) filter.teacherId = teacherId;
      if (semester) filter.semester = parseInt(semester, 10);
      if (year) filter.year = parseInt(year, 10);
      if (batch) filter.batch = batch;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      const classes = await classService.getAllClasses(
        parseInt(page, 10),
        parseInt(limit, 10),
        filter
      );
      
      return res.status(200).json(classes);
    } catch (error) {
      logger.error('Get classes by subject error:', error);
      next(error);
    }
  };
  
  // Enroll students in a class
  const enrollStudents = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;
      
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: 'Student IDs are required as an array' });
      }
      
      const updatedClass = await classService.enrollStudents(id, studentIds, req.user.id);
      
      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      return res.status(200).json({
        message: 'Students enrolled successfully',
        class: updatedClass
      });
    } catch (error) {
      logger.error('Enroll students error:', error);
      next(error);
    }
  };
  
  // Remove students from a class
  const removeStudents = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;
      
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: 'Student IDs are required as an array' });
      }
      
      const updatedClass = await classService.removeStudents(id, studentIds, req.user.id);
      
      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      return res.status(200).json({
        message: 'Students removed successfully',
        class: updatedClass
      });
    } catch (error) {
      logger.error('Remove students error:', error);
      next(error);
    }
  };
  
  export default {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassesByCourse,
    getClassesByTeacher,
    getClassesBySubject,
    enrollStudents,
    removeStudents
  };