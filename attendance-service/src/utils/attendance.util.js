import crypto from 'crypto';
import logger from './logger.js';

// Generate a random QR code value and expiry time
const generateQrCode = (sessionId) => {
  try {
    // Generate a random string for the QR code
    const randomBytes = crypto.randomBytes(16);
    const qrValue = `${sessionId}:${randomBytes.toString('hex')}`;
    
    // Set expiry time (4 seconds from now)
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 4);
    
    return {
      value: qrValue,
      expiryTime
    };
  } catch (error) {
    logger.error('Generate QR code error:', error);
    throw error;
  }
};

// Generate attendance window based on session time
const generateAttendanceWindow = (date, startTime, endTime) => {
  try {
    const sessionDate = new Date(date);
    
    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(num => parseInt(num, 10));
    const [endHour, endMinute] = endTime.split(':').map(num => parseInt(num, 10));
    
    // Set session start and end times
    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHour, startMinute, 0, 0);
    
    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHour, endMinute, 0, 0);
    
    // Attendance window: 15 minutes before session starts until 15 minutes after it ends
    const openTime = new Date(sessionStart);
    openTime.setMinutes(openTime.getMinutes() - 15);
    
    const closeTime = new Date(sessionEnd);
    closeTime.setMinutes(closeTime.getMinutes() + 15);
    
    return {
      openTime,
      closeTime
    };
  } catch (error) {
    logger.error('Generate attendance window error:', error);
    throw error;
  }
};

// Calculate attendance statistics for a student
const calculateAttendanceStats = (attendanceRecords) => {
  try {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
        percentage: 0
      };
    }
    
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
    
    // Calculate total and percentage
    const total = Object.values(counts).reduce((acc, val) => acc + val, 0);
    const presentEquivalent = counts.present + counts.late + counts.excused;
    const percentage = total > 0 ? (presentEquivalent / total) * 100 : 0;
    
    return {
      ...counts,
      total,
      percentage
    };
  } catch (error) {
    logger.error('Calculate attendance stats error:', error);
    throw error;
  }
};

// Format time string (HH:MM format)
const formatTimeString = (timeString) => {
  try {
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    logger.error('Format time string error:', error);
    return timeString;
  }
};

// Check if a date is today
const isToday = (date) => {
  try {
    const today = new Date();
    const checkDate = new Date(date);
    
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    logger.error('Is today check error:', error);
    return false;
  }
};

export default {
  generateQrCode,
  generateAttendanceWindow,
  calculateAttendanceStats,
  formatTimeString,
  isToday
};