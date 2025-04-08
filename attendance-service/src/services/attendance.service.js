import Attendance from '../models/attendance.model.js';
import Session from '../models/session.model.js';
import logger from '../utils/logger.js';

// Mark attendance for a student
const markAttendance = async (attendanceData) => {
  try {
    // Check if attendance already exists for this student in this session
    const existingAttendance = await Attendance.findOne({
      sessionId: attendanceData.sessionId,
      studentId: attendanceData.studentId
    });
    
    if (existingAttendance) {
      // Update existing attendance
      Object.assign(existingAttendance, attendanceData);
      await existingAttendance.save();
      return existingAttendance.toObject();
    }
    
    // Create new attendance record
    const attendance = new Attendance(attendanceData);
    await attendance.save();
    
    return attendance.toObject();
  } catch (error) {
    logger.error('Mark attendance service error:', error);
    throw error;
  }
};

// Update attendance
const updateAttendance = async (id, updateData) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return attendance ? attendance.toObject() : null;
  } catch (error) {
    logger.error('Update attendance service error:', error);
    throw error;
  }
};

// Get attendance by session
const getAttendanceBySession = async (sessionId) => {
  try {
    const attendance = await Attendance.find({ sessionId })
      .sort({ studentId: 1 })
      .lean();
    
    return attendance;
  } catch (error) {
    logger.error('Get attendance by session service error:', error);
    throw error;
  }
};

// Get attendance by student
const getAttendanceByStudent = async (studentId, sessionFilter = {}, dateFilter = {}) => {
  try {
    // First find sessions that match the filter
    const sessionQuery = { ...sessionFilter };
    
    // Add date filter if provided
    if (dateFilter.start || dateFilter.end) {
      sessionQuery.date = {};
      
      if (dateFilter.start) {
        sessionQuery.date.$gte = dateFilter.start;
      }
      
      if (dateFilter.end) {
        sessionQuery.date.$lte = dateFilter.end;
      }
    }
    
    // Get matching sessions
    const sessions = await Session.find(sessionQuery)
      .select('_id date startTime endTime subject courseId')
      .lean();
    
    const sessionIds = sessions.map(session => session._id);
    
    // Get attendance records for the student in these sessions
    const attendance = await Attendance.find({
      studentId,
      sessionId: { $in: sessionIds }
    }).lean();
    
    // Combine session and attendance data
    const sessionMap = new Map(sessions.map(session => [session._id.toString(), session]));
    
    const enrichedAttendance = attendance.map(record => {
      const session = sessionMap.get(record.sessionId.toString());
      return {
        ...record,
        session
      };
    });
    
    return enrichedAttendance;
  } catch (error) {
    logger.error('Get attendance by student service error:', error);
    throw error;
  }
};

// Check if attendance exists for a session
const checkAttendanceExists = async (sessionId) => {
  try {
    const count = await Attendance.countDocuments({ sessionId });
    return count > 0;
  } catch (error) {
    logger.error('Check attendance exists service error:', error);
    throw error;
  }
};

// Mark bulk attendance
const markBulkAttendance = async (sessionId, attendanceData, markedBy) => {
  try {
    // Validate that the session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process each attendance record
    for (const record of attendanceData) {
      try {
        // Verify student is expected to attend
        if (!session.expectedStudents.includes(record.studentId)) {
          results.failed++;
          results.errors.push({
            studentId: record.studentId,
            error: 'Student not registered for this session'
          });
          continue;
        }
        
        const attendanceRecord = {
          sessionId,
          studentId: record.studentId,
          status: record.status || 'present',
          markedBy,
          verificationMethod: 'manual',
          remarks: record.remarks
        };
        
        // Check if record already exists
        const existingAttendance = await Attendance.findOne({
          sessionId,
          studentId: record.studentId
        });
        
        if (existingAttendance) {
          // Update existing record
          Object.assign(existingAttendance, attendanceRecord);
          await existingAttendance.save();
        } else {
          // Create new record
          const attendance = new Attendance(attendanceRecord);
          await attendance.save();
        }
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          studentId: record.studentId,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    logger.error('Mark bulk attendance service error:', error);
    throw error;
  }
};

export default {
  markAttendance,
  updateAttendance,
  getAttendanceBySession,
  getAttendanceByStudent,
  checkAttendanceExists,
  markBulkAttendance
};