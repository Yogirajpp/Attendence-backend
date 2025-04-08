import sessionService from '../services/session.service.js';
import attendanceService from '../services/attendance.service.js';
import recordService from '../services/record.service.js';
import attendanceUtil from '../utils/attendance.util.js';
import logger from '../utils/logger.js';

// Create a new session
const createSession = async (req, res, next) => {
  try {
    // Add creator info from authenticated user
    const sessionData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Generate attendance window if not provided
    if (!sessionData.attendanceWindow) {
      const { startTime, endTime, date } = sessionData;
      sessionData.attendanceWindow = attendanceUtil.generateAttendanceWindow(date, startTime, endTime);
    }
    
    // Set initial status based on date and time
    const now = new Date();
    const sessionDate = new Date(sessionData.date);
    sessionDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (sessionDate < today) {
      sessionData.status = 'completed';
    } else if (sessionDate.getTime() === today.getTime()) {
      // Check if session has already ended
      const endTimeParts = sessionData.endTime.split(':');
      const endHour = parseInt(endTimeParts[0], 10);
      const endMinute = parseInt(endTimeParts[1], 10);
      
      const endDateTime = new Date(sessionDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      if (now > endDateTime) {
        sessionData.status = 'completed';
      } else {
        const startTimeParts = sessionData.startTime.split(':');
        const startHour = parseInt(startTimeParts[0], 10);
        const startMinute = parseInt(startTimeParts[1], 10);
        
        const startDateTime = new Date(sessionDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        if (now >= startDateTime && now <= endDateTime) {
          sessionData.status = 'in-progress';
        } else {
          sessionData.status = 'scheduled';
        }
      }
    } else {
      sessionData.status = 'scheduled';
    }
    
    const session = await sessionService.createSession(sessionData);
    
    return res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    logger.error('Create session error:', error);
    next(error);
  }
};

// Get all sessions with pagination and filtering
const getAllSessions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      classId, 
      teacherId, 
      courseId, 
      subjectId, 
      date,
      startDate,
      endDate,
      status,
      collegeId,
      departmentId
    } = req.query;
    
    // Create filter object
    const filter = {};
    if (classId) filter.classId = classId;
    if (teacherId) filter.teacherId = teacherId;
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (collegeId) filter.collegeId = collegeId;
    if (departmentId) filter.departmentId = departmentId;
    if (status) filter.status = status;
    
    // Handle date filters
    if (date) {
      // Filter for specific date
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filter.date = {
        $gte: dateObj,
        $lt: nextDay
      };
    } else if (startDate || endDate) {
      // Filter for date range
      filter.date = {};
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        filter.date.$gte = startDateObj;
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateObj;
      }
    }
    
    const sessions = await sessionService.getAllSessions(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(sessions);
  } catch (error) {
    logger.error('Get all sessions error:', error);
    next(error);
  }
};

// Get session by ID
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const session = await sessionService.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    return res.status(200).json({ session });
  } catch (error) {
    logger.error('Get session by ID error:', error);
    next(error);
  }
};

// Update session
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Only teachers who created the session or admins can update it
    const session = await sessionService.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (req.user.role === 'teacher' && session.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update sessions you created' });
    }
    
    // Add updater info from authenticated user
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    // If the session dates or times are updated, recalculate the attendance window
    if (updateData.date || updateData.startTime || updateData.endTime) {
      const date = updateData.date || session.date;
      const startTime = updateData.startTime || session.startTime;
      const endTime = updateData.endTime || session.endTime;
      
      updateData.attendanceWindow = attendanceUtil.generateAttendanceWindow(date, startTime, endTime);
    }
    
    const updatedSession = await sessionService.updateSession(id, updateData);
    
    return res.status(200).json({
      message: 'Session updated successfully',
      session: updatedSession
    });
  } catch (error) {
    logger.error('Update session error:', error);
    next(error);
  }
};

// Delete session
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Only teachers who created the session or admins can delete it
    const session = await sessionService.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (req.user.role === 'teacher' && session.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete sessions you created' });
    }
    
    // Check if attendance records exist for this session
    const attendanceExists = await attendanceService.checkAttendanceExists(id);
    
    if (attendanceExists) {
      return res.status(400).json({ 
        message: 'Cannot delete session with existing attendance records. Mark it as cancelled instead.' 
      });
    }
    
    const result = await sessionService.deleteSession(id);
    
    return res.status(200).json({
      message: 'Session deleted successfully'
    });
  } catch (error) {
    logger.error('Delete session error:', error);
    next(error);
  }
};

// Cancel session
const cancelSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Only teachers who created the session or admins can cancel it
    const session = await sessionService.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (req.user.role === 'teacher' && session.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only cancel sessions you created' });
    }
    
    // Update session status to cancelled
    const updateData = {
      status: 'cancelled',
      updatedBy: req.user.id,
      description: reason || 'Session cancelled'
    };
    
    const updatedSession = await sessionService.updateSession(id, updateData);
    
    // Update records if needed
    recordService.updateRecord(updatedSession);
    
    return res.status(200).json({
      message: 'Session cancelled successfully',
      session: updatedSession
    });
  } catch (error) {
    logger.error('Cancel session error:', error);
    next(error);
  }
};

// Generate QR code for a session
const generateQrCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Only teachers who created the session or admins can generate QR codes
    const session = await sessionService.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (req.user.role === 'teacher' && session.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only generate QR codes for your sessions' });
    }
    
    // Check if session is active
    if (session.status !== 'in-progress') {
      return res.status(400).json({ message: 'QR codes can only be generated for in-progress sessions' });
    }
    
    // Check if attendance window is open
    const now = new Date();
    
    if (now < session.attendanceWindow.openTime) {
      return res.status(400).json({ message: 'Attendance window not open yet' });
    }
    
    if (now > session.attendanceWindow.closeTime) {
      return res.status(400).json({ message: 'Attendance window closed' });
    }
    
    // Generate QR code
    const qrCodeData = attendanceUtil.generateQrCode(id);
    
    // Update session with QR code
    const updateData = {
      qrCode: {
        value: qrCodeData.value,
        expiryTime: qrCodeData.expiryTime
      },
      updatedBy: req.user.id
    };
    
    await sessionService.updateSession(id, updateData);
    
    return res.status(200).json({
      message: 'QR code generated successfully',
      qrCode: qrCodeData.value,
      expiryTime: qrCodeData.expiryTime
    });
  } catch (error) {
    logger.error('Generate QR code error:', error);
    next(error);
  }
};

// Get sessions by student
const getSessionsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      courseId, 
      subjectId, 
      startDate,
      endDate,
      status
    } = req.query;
    
    // Verify the requesting user is the student or a teacher/admin
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'You can only view your own sessions' });
    }
    
    // Create filter object
    const filter = {
      expectedStudents: studentId
    };
    
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (status) filter.status = status;
    
    // Handle date filters
    if (startDate || endDate) {
      filter.date = {};
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        filter.date.$gte = startDateObj;
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateObj;
      }
    }
    
    const sessions = await sessionService.getAllSessions(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(sessions);
  } catch (error) {
    logger.error('Get sessions by student error:', error);
    next(error);
  }
};

// Get sessions by teacher
const getSessionsByTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      courseId, 
      subjectId, 
      startDate,
      endDate,
      status
    } = req.query;
    
    // Verify the requesting user is the teacher or an admin
    if (req.user.role === 'teacher' && req.user.id !== teacherId) {
      return res.status(403).json({ message: 'You can only view your own sessions' });
    }
    
    // Create filter object
    const filter = {
      teacherId
    };
    
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (status) filter.status = status;
    
    // Handle date filters
    if (startDate || endDate) {
      filter.date = {};
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        filter.date.$gte = startDateObj;
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateObj;
      }
    }
    
    const sessions = await sessionService.getAllSessions(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(sessions);
  } catch (error) {
    logger.error('Get sessions by teacher error:', error);
    next(error);
  }
};

export default {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
    cancelSession,
    generateQrCode,
    getSessionsByStudent,
    getSessionsByTeacher
};