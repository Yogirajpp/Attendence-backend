import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from './logger.js';

// Generate a random token
const generateRandomToken = (length = 40) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate a JWT token
const generateJwtToken = (payload, expiresIn = config.jwt.accessExpiresIn) => {
  try {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  } catch (error) {
    logger.error('Generate JWT token error:', error);
    throw error;
  }
};

// Verify a JWT token
const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    logger.error('Verify JWT token error:', error);
    return null;
  }
};

export default {
  generateRandomToken,
  generateJwtToken,
  verifyJwtToken
};