import recordService from '../services/record.service.js';
import logger from '../utils/logger.js';

// Get all records with pagination and filtering
const getAllRecords = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      courseId, 
      subjectId, 
      classId, 
      teacherId,
      collegeId,
      departmentId,
      semester,
      year,
      batch
    } = req.query;
    
    // Create filter object
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (classId) filter.classId = classId;
    if (teacherId) filter.teacherId = teacherId;
    if (collegeId) filter.collegeId = collegeId;
    if (departmentId) filter.departmentId = departmentId;
    if (semester) filter.semester = parseInt(semester, 10);
    if (year) filter.year = parseInt(year, 10);
    if (batch) filter.batch = batch;
    
    const records = await recordService.getAllRecords(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(records);
  } catch (error) {
    logger.error('Get all records error:', error);
    next(error);
  }
};

// Get record by ID
const getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const record = await recordService.getRecordById(id);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    return res.status(200).json({ record });
  } catch (error) {
    logger.error('Get record by ID error:', error);
    next(error);
  }
};

// Get records by course
const getRecordsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      subjectId,
      teacherId,
      semester,
      year,
      batch
    } = req.query;
    
    // Create filter object
    const filter = { courseId };
    if (subjectId) filter.subjectId = subjectId;
    if (teacherId) filter.teacherId = teacherId;
    if (semester) filter.semester = parseInt(semester, 10);
    if (year) filter.year = parseInt(year, 10);
    if (batch) filter.batch = batch;
    
    const records = await recordService.getAllRecords(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(records);
  } catch (error) {
    logger.error('Get records by course error:', error);
    next(error);
  }
};

// Get records by student
const getRecordsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      courseId,
      subjectId,
      semester,
      year
    } = req.query;
    
    // Verify the requesting user is the student or a teacher/admin
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'You can only view your own records' });
    }
    
    // Create filter object for the student record
    const filter = { 'studentRecords.studentId': studentId };
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (semester) filter.semester = parseInt(semester, 10);
    if (year) filter.year = parseInt(year, 10);
    
    const records = await recordService.getAllRecords(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    // Extract only the student's data from each record
    const studentRecords = records.records.map(record => {
      const studentRecord = record.studentRecords.find(sr => sr.studentId === studentId);
      return {
        recordId: record._id,
        courseId: record.courseId,
        subjectId: record.subjectId,
        classId: record.classId,
        semester: record.semester,
        year: record.year,
        batch: record.batch,
        startDate: record.startDate,
        endDate: record.endDate,
        totalSessions: record.totalSessions,
        attendanceData: studentRecord || null
      };
    });
    
    return res.status(200).json({
      records: studentRecords,
      pagination: records.pagination
    });
  } catch (error) {
    logger.error('Get records by student error:', error);
    next(error);
  }
};

// Get records by teacher
const getRecordsByTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      courseId,
      subjectId,
      semester,
      year,
      batch
    } = req.query;
    
    // Verify the requesting user is the teacher or an admin
    if (req.user.role === 'teacher' && req.user.id !== teacherId) {
      return res.status(403).json({ message: 'You can only view your own records' });
    }
    
    // Create filter object
    const filter = { teacherId };
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (semester) filter.semester = parseInt(semester, 10);
    if (year) filter.year = parseInt(year, 10);
    if (batch) filter.batch = batch;
    
    const records = await recordService.getAllRecords(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(records);
  } catch (error) {
    logger.error('Get records by teacher error:', error);
    next(error);
  }
};

// Get class attendance statistics
const getClassStatistics = async (req, res, next) => {
  try {
    const { classId } = req.params;
    
    const statistics = await recordService.getClassStatistics(classId);
    
    return res.status(200).json({ statistics });
  } catch (error) {
    logger.error('Get class statistics error:', error);
    next(error);
  }
};

// Regenerate a record (useful if data needs to be fixed)
const regenerateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Only admins or college admins can regenerate records
    if (!['admin', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to regenerate records' });
    }
    
    const record = await recordService.getRecordById(id);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    // Regenerate the record by recalculating from attendance data
    const regeneratedRecord = await recordService.regenerateRecord(id);
    
    return res.status(200).json({
      message: 'Record regenerated successfully',
      record: regeneratedRecord
    });
  } catch (error) {
    logger.error('Regenerate record error:', error);
    next(error);
  }
};

export default {
  getAllRecords,
  getRecordById,
  getRecordsByCourse,
  getRecordsByStudent,
  getRecordsByTeacher,
  getClassStatistics,
  regenerateRecord
};