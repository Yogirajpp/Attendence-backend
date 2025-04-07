import bcrypt from 'bcrypt';
import crypto from 'crypto';
import logger from './logger.js';

// Hash a password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('Hash password error:', error);
    throw error;
  }
};

// Compare a password with a hash
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Compare password error:', error);
    throw error;
  }
};

// Generate a random password
const generateRandomPassword = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  return password;
};

export default {
  hashPassword,
  comparePassword,
  generateRandomPassword
};