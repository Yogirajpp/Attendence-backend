import crypto from 'crypto';
import logger from './logger.js';

// Generate a random code (for colleges, departments, etc.)
const generateCode = (prefix = '', length = 6) => {
  try {
    const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
    const randomHex = randomBytes.toString('hex').slice(0, length);
    return `${prefix}${randomHex.toUpperCase()}`;
  } catch (error) {
    logger.error('Generate code error:', error);
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

// Check if two time ranges overlap
const timeRangesOverlap = (range1, range2) => {
  try {
    // Convert time strings to minutes since midnight
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const start1 = timeToMinutes(range1.startTime);
    const end1 = timeToMinutes(range1.endTime);
    const start2 = timeToMinutes(range2.startTime);
    const end2 = timeToMinutes(range2.endTime);
    
    // Check for overlap
    return (start1 < end2) && (start2 < end1);
  } catch (error) {
    logger.error('Time ranges overlap check error:', error);
    return false;
  }
};

// Calculate class duration in minutes
const calculateClassDuration = (startTime, endTime) => {
  try {
    // Convert time strings to minutes since midnight
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    
    // Handle case where class goes past midnight
    if (end < start) {
      return (24 * 60 - start) + end;
    }
    
    return end - start;
  } catch (error) {
    logger.error('Calculate class duration error:', error);
    return 0;
  }
};

// Generate batch code from year range
const generateBatchCode = (startYear, endYear = null) => {
  if (!endYear) {
    // If no end year provided, calculate based on typical duration (4 years)
    endYear = parseInt(startYear, 10) + 4;
  }
  
  return `${startYear}-${endYear}`;
};

export default {
  generateCode,
  formatTimeString,
  timeRangesOverlap,
  calculateClassDuration,
  generateBatchCode
};