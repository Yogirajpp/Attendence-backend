import crypto from 'crypto';
import logger from './logger.js';

// Generate a random ID
const generateRandomId = (prefix = '', length = 10) => {
  try {
    const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
    const randomId = randomBytes.toString('hex').slice(0, length);
    return `${prefix}${randomId}`;
  } catch (error) {
    logger.error('Generate random ID error:', error);
    throw error;
  }
};

// Format name (capitalize first letter of each word)
const formatName = (name) => {
  try {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } catch (error) {
    logger.error('Format name error:', error);
    return name;
  }
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format
const isValidPhone = (phone) => {
  // Simple validation - adjust as needed for specific requirements
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

// Format date to ISO string (YYYY-MM-DD)
const formatDate = (date) => {
  try {
    if (!date) return null;
    
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    logger.error('Format date error:', error);
    return null;
  }
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  try {
    if (!dateOfBirth) return null;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    logger.error('Calculate age error:', error);
    return null;
  }
};

export default {
  generateRandomId,
  formatName,
  isValidEmail,
  isValidPhone,
  formatDate,
  calculateAge
};