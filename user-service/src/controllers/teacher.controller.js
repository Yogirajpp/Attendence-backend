import teacherService from '../services/teacher.service.js';
import logger from '../utils/logger.js';

// Get all teachers with pagination and filtering
const getAllTeachers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      collegeId, 
      departmentId, 
      subjectId, 
      search, 
      isActive 
    } = req.query;
    
    // Create filter object
    const filter = {};
    if (collegeId) filter.collegeId = collegeId;
    if (departmentId) filter.departmentId = departmentId;
    if (subjectId) filter.subjects = subjectId; // Array field in the schema
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const teachers = await teacherService.getAllTeachers(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter,
      search
    );
    
    return res.status(200).json(teachers);
  } catch (error) {
    logger.error('Get all teachers error:', error);
    next(error);
  }
};

// Get teacher by ID
const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const teacher = await teacherService.getTeacherById(id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    return res.status(200).json({ teacher });
  } catch (error) {
    logger.error('Get teacher by ID error:', error);
    next(error);
  }
};

// Create a new teacher
const createTeacher = async (req, res, next) => {
  try {
    const teacherData = req.body;
    
    const teacher = await teacherService.createTeacher(teacherData);
    
    return res.status(201).json({
      message: 'Teacher created successfully',
      teacher
    });
  } catch (error) {
    logger.error('Create teacher error:', error);
    next(error);
  }
};

// Update teacher
const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedTeacher = await teacherService.updateTeacher(id, updateData);
    
    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    return res.status(200).json({
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    logger.error('Update teacher error:', error);
    next(error);
  }
};

// Delete teacher
const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await teacherService.deleteTeacher(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    return res.status(200).json({
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    logger.error('Delete teacher error:', error);
    next(error);
  }
};

// Get teacher profile (used by teachers to get their own profile)
const getTeacherProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT token
    
    const teacher = await teacherService.getTeacherByUserId(userId);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    return res.status(200).json({ teacher });
  } catch (error) {
    logger.error('Get teacher profile error:', error);
    next(error);
  }
};

// Assign subjects to a teacher
const assignSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;
    
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects must be an array of subject IDs' });
    }
    
    const updatedTeacher = await teacherService.assignSubjects(id, subjects);
    
    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    return res.status(200).json({
      message: 'Subjects assigned successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    logger.error('Assign subjects error:', error);
    next(error);
  }
};

// Remove subjects from a teacher
const removeSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;
    
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects must be an array of subject IDs' });
    }
    
    const updatedTeacher = await teacherService.removeSubjects(id, subjects);
    
    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    return res.status(200).json({
      message: 'Subjects removed successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    logger.error('Remove subjects error:', error);
    next(error);
  }
};

// Get teachers by subject
const getTeachersBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { collegeId, departmentId } = req.query;
    
    // Create filter object
    const filter = { subjects: subjectId };
    if (collegeId) filter.collegeId = collegeId;
    if (departmentId) filter.departmentId = departmentId;
    
    const teachers = await teacherService.getTeachersByCriteria(filter);
    
    return res.status(200).json({ teachers });
  } catch (error) {
    logger.error('Get teachers by subject error:', error);
    next(error);
  }
};

// Get teachers by department
const getTeachersByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { collegeId } = req.query;
    
    // Create filter object
    const filter = { departmentId };
    if (collegeId) filter.collegeId = collegeId;
    
    const teachers = await teacherService.getTeachersByCriteria(filter);
    
    return res.status(200).json({ teachers });
  } catch (error) {
    logger.error('Get teachers by department error:', error);
    next(error);
  }
};

// Get teachers by college
const getTeachersByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const { departmentId } = req.query;
    
    // Create filter object
    const filter = { collegeId };
    if (departmentId) filter.departmentId = departmentId;
    
    const teachers = await teacherService.getTeachersByCriteria(filter);
    
    return res.status(200).json({ teachers });
  } catch (error) {
    logger.error('Get teachers by college error:', error);
    next(error);
  }
};

export default {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherProfile,
  assignSubjects,
  removeSubjects,
  getTeachersBySubject,
  getTeachersByDepartment,
  getTeachersByCollege
};