import attendanceService from '../services/attendance.service.js';
import sessionService from '../services/session.service.js';
import recordService from '../services/record.service.js';
import logger from '../utils/logger.js';

// Mark attendance
const markAttendance = async (req, res, next) => {
  try {
    const { sessionId, studentId, status, qrToken, biometricToken } = req.body;
    
    // Verify the session is valid and open for attendance
    const session = await sessionService.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if the session is open for attendance
    const now = new Date();
    
    if (now < session.attendanceWindow.openTime) {
      return res.status(400).json({ message: 'Attendance window not open yet' });
    }
    
    if (now > session.attendanceWindow.closeTime) {
      return res.status(400).json({ message: 'Attendance window closed' });
    }
    
    // Verify the student is expected to attend this session
    if (!session.expectedStudents.includes(studentId)) {
      return res.status(403).json({ message: 'Student not registered for this session' });
    }
    
    // Determine verification method
    let verificationMethod = 'manual';
    let biometricVerified = false;
    let qrVerified = false;
    
    if (qrToken && session.qrCode && session.qrCode.value === qrToken) {
      // Verify QR token hasn't expired
      if (session.qrCode.expiryTime > now) {
        qrVerified = true;
        verificationMethod = 'qr';
      }
    }
    
    if (biometricToken) {
      // Biometric verification would be handled by biometric-service
      // This is a simplified version
      biometricVerified = true;
      verificationMethod = biometricVerified ? 'biometric' : verificationMethod;
    }
    
    // User marking attendance (either student self-marking or teacher)
    const markedBy = req.user.id;
    
    // Handle location data if provided
    const location = req.body.location || null;
    
    // Get device and IP information
    const device = req.headers['user-agent'] || null;
    const ipAddress = req.ip || null;
    
    const attendanceData = {
      sessionId,
      studentId,
      status: status || 'present', // Default to present
      markedBy,
      biometricVerified,
      qrVerified,
      verificationMethod,
      location,
      device,
      ipAddress,
      remarks: req.body.remarks || null
    };
    
    const attendance = await attendanceService.markAttendance(attendanceData);
    
    // Update the record table in the background
    recordService.updateRecord(session);
    
    return res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    logger.error('Mark attendance error:', error);
    next(error);
  }
};

// Update attendance
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    // Only teachers or admins can update attendance
    if (!['teacher', 'college_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to update attendance' });
    }
    
    const updateData = {
      status,
      remarks,
      markedBy: req.user.id, // Update who modified it
      markedAt: new Date(), // Update the timestamp
      verificationMethod: 'manual' // Manual update by teacher/admin
    };
    
    const attendance = await attendanceService.updateAttendance(id, updateData);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Get the session to update the record
    const session = await sessionService.getSessionById(attendance.sessionId);
    
    // Update the record table in the background
    recordService.updateRecord(session);
    
    return res.status(200).json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    logger.error('Update attendance error:', error);
    next(error);
  }
};

// Get attendance by session
const getAttendanceBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const attendance = await attendanceService.getAttendanceBySession(sessionId);
    
    return res.status(200).json({ attendance });
  } catch (error) {
    logger.error('Get attendance by session error:', error);
    next(error);
  }
};

// Get attendance by student
const getAttendanceByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { courseId, subjectId, startDate, endDate } = req.query;
    
    // Create filter object
    const filter = { studentId };
    
    // Only include filters if they are provided
    const sessionFilter = {};
    if (courseId) sessionFilter.courseId = courseId;
    if (subjectId) sessionFilter.subjectId = subjectId;
    
    // Date range filter
    const dateFilter = {};
    if (startDate) dateFilter.start = new Date(startDate);
    if (endDate) dateFilter.end = new Date(endDate);
    
    const attendance = await attendanceService.getAttendanceByStudent(
      studentId, 
      sessionFilter, 
      dateFilter
    );
    
    return res.status(200).json({ attendance });
  } catch (error) {
    logger.error('Get attendance by student error:', error);
    next(error);
  }
};

// Get student attendance summary
const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { courseId, subjectId } = req.query;
    
    // Create filter for the records
    const filter = { studentId };
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    
    const summary = await recordService.getStudentAttendanceSummary(filter);
    
    return res.status(200).json({ summary });
  } catch (error) {
    logger.error('Get student attendance summary error:', error);
    next(error);
  }
};

// Mark bulk attendance by teacher
const markBulkAttendance = async (req, res, next) => {
  try {
    const { sessionId, attendanceData } = req.body;
    
    // Verify the user is a teacher or admin
    if (!['teacher', 'college_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to mark bulk attendance' });
    }
    
    // Verify the session exists
    const session = await sessionService.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Verify the user is the teacher for this session or an admin
    if (req.user.role === 'teacher' && session.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to mark attendance for this session' });
    }
    
    // Validate the attendanceData format
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ message: 'Invalid attendance data format' });
    }
    
    // Process bulk attendance
    const results = await attendanceService.markBulkAttendance(
      sessionId,
      attendanceData,
      req.user.id
    );
    
    // Update the record table in the background
    recordService.updateRecord(session);
    
    return res.status(200).json({
      message: 'Bulk attendance marked successfully',
      results
    });
  } catch (error) {
    logger.error('Mark bulk attendance error:', error);
    next(error);
  }
};

export default {
  markAttendance,
  updateAttendance,
  getAttendanceBySession,
  getAttendanceByStudent,
  getStudentAttendanceSummary,
  markBulkAttendance
};