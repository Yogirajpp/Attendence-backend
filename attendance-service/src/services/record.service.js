import Record from '../models/record.model.js';
import Attendance from '../models/attendance.model.js';
import Session from '../models/session.model.js';
import logger from '../utils/logger.js';

// Get all records with pagination and filtering
const getAllRecords = async (page, limit, filter = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get records with pagination
    const records = await Record.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ lastUpdated: -1 })
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await Record.countDocuments(filter);
    
    return {
      records,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all records service error:', error);
    throw error;
  }
};

// Get record by ID
const getRecordById = async (id) => {
  try {
    return await Record.findById(id).select('-__v').lean();
  } catch (error) {
    logger.error('Get record by ID service error:', error);
    throw error;
  }
};

// Update or create a record based on a session
const updateRecord = async (session) => {
  try {
    // Skip if session is not valid
    if (!session || session.status === 'cancelled') {
      return;
    }
    
    // Find or create record for this class/course/subject
    let record = await Record.findOne({
      classId: session.classId,
      courseId: session.courseId,
      subjectId: session.subjectId,
      semester: session.semester,
      year: session.year,
      batch: session.batch
    });
    
    if (!record) {
      // Create new record
      record = new Record({
        classId: session.classId,
        courseId: session.courseId,
        subjectId: session.subjectId,
        collegeId: session.collegeId,
        departmentId: session.departmentId,
        teacherId: session.teacherId,
        semester: session.semester,
        year: session.year,
        batch: session.batch,
        startDate: session.date, // Will be updated if earlier sessions exist
        endDate: session.date,   // Will be updated if later sessions exist
        totalSessions: 0,
        studentRecords: []
      });
    }
    
    // Get all sessions for this class/course/subject
    const sessions = await Session.find({
      classId: session.classId,
      courseId: session.courseId,
      subjectId: session.subjectId,
      status: { $ne: 'cancelled' } // Exclude cancelled sessions
    }).lean();
    
    // Update dates
    const sessionDates = sessions.map(s => new Date(s.date));
    if (sessionDates.length > 0) {
      record.startDate = new Date(Math.min(...sessionDates));
      record.endDate = new Date(Math.max(...sessionDates));
    }
    
    // Update total sessions
    record.totalSessions = sessions.length;
    
    // Get all students who should have attendance
    const allStudents = new Set();
    sessions.forEach(s => {
      s.expectedStudents.forEach(studentId => {
        allStudents.add(studentId);
      });
    });
    
    // Calculate attendance for each student
    const studentRecords = [];
    
    for (const studentId of allStudents) {
      // Get all attendance records for this student across all sessions
      const attendanceRecords = await Attendance.find({
        sessionId: { $in: sessions.map(s => s._id) },
        studentId
      }).lean();
      
      // Count attendance types
      const counts = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      };
      
      attendanceRecords.forEach(record => {
        counts[record.status]++;
      });
      
      // Calculate attendance percentage
      const totalMarked = Object.values(counts).reduce((acc, val) => acc + val, 0);
      const presentEquivalent = counts.present + counts.late + counts.excused;
      
      const attendancePercentage = totalMarked > 0
        ? (presentEquivalent / totalMarked) * 100
        : 0;
      
      studentRecords.push({
        studentId,
        totalSessions: sessions.length,
        attended: presentEquivalent,
        absent: counts.absent,
        late: counts.late,
        excused: counts.excused,
        attendancePercentage
      });
    }
    
    // Update record with student attendance data
    record.studentRecords = studentRecords;
    record.lastUpdated = new Date();
    
    await record.save();
    
    return record;
  } catch (error) {
    logger.error('Update record service error:', error);
    throw error;
  }
};

// Get student attendance summary
const getStudentAttendanceSummary = async (filter) => {
  try {
    const { studentId } = filter;
    
    // Remove studentId from filter to query records
    const recordFilter = { ...filter };
    delete recordFilter.studentId;
    
    // Add filter to find records containing this student
    recordFilter['studentRecords.studentId'] = studentId;
    
    // Get records for this student
    const records = await Record.find(recordFilter).lean();
    
    // Extract student's data from each record
    const studentData = records.map(record => {
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
        attended: studentRecord ? studentRecord.attended : 0,
        absent: studentRecord ? studentRecord.absent : 0,
        late: studentRecord ? studentRecord.late : 0,
        excused: studentRecord ? studentRecord.excused : 0,
        attendancePercentage: studentRecord ? studentRecord.attendancePercentage : 0
      };
    });
    
    // Calculate overall statistics
    const totalSessions = studentData.reduce((sum, record) => sum + record.totalSessions, 0);
    const totalAttended = studentData.reduce((sum, record) => sum + record.attended, 0);
    const totalAbsent = studentData.reduce((sum, record) => sum + record.absent, 0);
    const totalLate = studentData.reduce((sum, record) => sum + record.late, 0);
    const totalExcused = studentData.reduce((sum, record) => sum + record.excused, 0);
    
    const overallAttendancePercentage = totalSessions > 0
      ? (totalAttended / totalSessions) * 100
      : 0;
    
    return {
      studentId,
      records: studentData,
      summary: {
        totalSessions,
        totalAttended,
        totalAbsent,
        totalLate,
        totalExcused,
        overallAttendancePercentage
      }
    };
  } catch (error) {
    logger.error('Get student attendance summary service error:', error);
    throw error;
  }
};

// Get class statistics
const getClassStatistics = async (classId) => {
  try {
    // Get record for this class
    const record = await Record.findOne({ classId }).lean();
    
    if (!record) {
      return {
        message: 'No attendance records found for this class'
      };
    }
    
    // Calculate statistics
    const totalStudents = record.studentRecords.length;
    const attendancePercentages = record.studentRecords.map(sr => sr.attendancePercentage);
    
    const averageAttendance = attendancePercentages.reduce((acc, val) => acc + val, 0) / totalStudents;
    
    // Count students in different attendance bands
    const excellentAttendance = record.studentRecords.filter(sr => sr.attendancePercentage >= 90).length;
    const goodAttendance = record.studentRecords.filter(sr => sr.attendancePercentage >= 75 && sr.attendancePercentage < 90).length;
    // const averageAttendance = record.studentRecords.filter(sr => sr.attendancePercentage >= 60 && sr.attendancePercentage < 75).length;
    const poorAttendance = record.studentRecords.filter(sr => sr.attendancePercentage < 60).length;
    
    // Find students with perfect attendance
    const perfectAttendance = record.studentRecords.filter(sr => sr.attendancePercentage === 100).length;
    
    // Find students with critical attendance (below certain threshold)
    const criticalAttendance = record.studentRecords.filter(sr => sr.attendancePercentage < 50).length;
    
    return {
      classId,
      courseId: record.courseId,
      subjectId: record.subjectId,
      totalSessions: record.totalSessions,
      totalStudents,
      averageAttendancePercentage: averageAttendance,
      attendanceCounts: {
        excellent: excellentAttendance,
        good: goodAttendance,
        average: averageAttendance,
        poor: poorAttendance,
        perfect: perfectAttendance,
        critical: criticalAttendance
      }
    };
  } catch (error) {
    logger.error('Get class statistics service error:', error);
    throw error;
  }
};

// Regenerate a record (recalculate from attendance data)
const regenerateRecord = async (id) => {
  try {
    const record = await Record.findById(id);
    
    if (!record) {
      throw new Error('Record not found');
    }
    
    // Get any session for this record to trigger a full recalculation
    const session = await Session.findOne({
      classId: record.classId,
      courseId: record.courseId,
      subjectId: record.subjectId
    });
    
    if (!session) {
      throw new Error('No sessions found for this record');
    }
    
    // Regenerate record
    return await updateRecord(session);
  } catch (error) {
    logger.error('Regenerate record service error:', error);
    throw error;
  }
};

export default {
  getAllRecords,
  getRecordById,
  updateRecord,
  getStudentAttendanceSummary,
  getClassStatistics,
  regenerateRecord
};