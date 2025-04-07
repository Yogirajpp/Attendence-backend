import studentService from '../services/student.service.js';
import logger from '../utils/logger.js';

// Get all students with pagination and filtering
const getAllStudents = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      collegeId, 
      departmentId, 
      courseId, 
      batch, 
      year, 
      semester, 
      search, 
      isActive 
    } = req.query;
    
    // Create filter object
    const filter = {};
    if (collegeId) filter.collegeId = collegeId;
    if (departmentId) filter.departmentId = departmentId;
    if (courseId) filter.courseId = courseId;
    if (batch) filter.batch = batch;
    if (year) filter.year = parseInt(year, 10);
    if (semester) filter.semester = parseInt(semester, 10);
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      // Student search requires a different approach as we need to search in user model too
      // This will be handled in the service
    }
    
    const students = await studentService.getAllStudents(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter,
      search
    );
    
    return res.status(200).json(students);
  } catch (error) {
    logger.error('Get all students error:', error);
    next(error);
  }
};

// Get student by ID
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const student = await studentService.getStudentById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    return res.status(200).json({ student });
  } catch (error) {
    logger.error('Get student by ID error:', error);
    next(error);
  }
};

// Create a new student
const createStudent = async (req, res, next) => {
  try {
    const studentData = req.body;
    
    const student = await studentService.createStudent(studentData);
    
    return res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    logger.error('Create student error:', error);
    next(error);
  }
};

// Update student
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedStudent = await studentService.updateStudent(id, updateData);
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    return res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    logger.error('Update student error:', error);
    next(error);
  }
};

// Delete student
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await studentService.deleteStudent(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    return res.status(200).json({
      message: 'Student deleted successfully'
    });
  } catch (error) {
    logger.error('Delete student error:', error);
    next(error);
  }
};

// Get student profile (used by students to get their own profile)
const getStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT token
    
    const student = await studentService.getStudentByUserId(userId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    return res.status(200).json({ student });
  } catch (error) {
    logger.error('Get student profile error:', error);
    next(error);
  }
};

// Get students by course
const getStudentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { year, semester, batch } = req.query;
    
    // Create filter object
    const filter = { courseId };
    if (year) filter.year = parseInt(year, 10);
    if (semester) filter.semester = parseInt(semester, 10);
    if (batch) filter.batch = batch;
    
    const students = await studentService.getStudentsByCriteria(filter);
    
    return res.status(200).json({ students });
  } catch (error) {
    logger.error('Get students by course error:', error);
    next(error);
  }
};

// Get students by department
const getStudentsByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { courseId, year, semester, batch } = req.query;
    
    // Create filter object
    const filter = { departmentId };
    if (courseId) filter.courseId = courseId;
    if (year) filter.year = parseInt(year, 10);
    if (semester) filter.semester = parseInt(semester, 10);
    if (batch) filter.batch = batch;
    
    const students = await studentService.getStudentsByCriteria(filter);
    
    return res.status(200).json({ students });
  } catch (error) {
    logger.error('Get students by department error:', error);
    next(error);
  }
};

// Get students by college
const getStudentsByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const { departmentId, courseId, year, semester, batch } = req.query;
    
    // Create filter object
    const filter = { collegeId };
    if (departmentId) filter.departmentId = departmentId;
    if (courseId) filter.courseId = courseId;
    if (year) filter.year = parseInt(year, 10);
    if (semester) filter.semester = parseInt(semester, 10);
    if (batch) filter.batch = batch;
    
    const students = await studentService.getStudentsByCriteria(filter);
    
    return res.status(200).json({ students });
  } catch (error) {
    logger.error('Get students by college error:', error);
    next(error);
  }
};

export default {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentProfile,
  getStudentsByCourse,
  getStudentsByDepartment,
  getStudentsByCollege
};