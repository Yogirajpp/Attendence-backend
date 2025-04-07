import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// In-memory refresh token store (should be replaced with Redis in production)
const refreshTokens = new Map();

// Generate access and refresh tokens
const generateTokens = async (user) => {
  try {
    const payload = user.getJwtPayload();
    
    // Generate access token
    const accessToken = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
    
    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Store refresh token with user ID
    refreshTokens.set(refreshToken, {
      userId: user._id.toString(),
      expiresAt: Date.now() + (parseInt(config.jwt.refreshExpiresIn) * 1000)
    });
    
    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    logger.error('Generate tokens error:', error);
    throw error;
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    // Check if refresh token exists
    const tokenData = refreshTokens.get(refreshToken);
    
    if (!tokenData) {
      return null;
    }
    
    // Check if token is expired
    if (tokenData.expiresAt < Date.now()) {
      refreshTokens.delete(refreshToken);
      return null;
    }
    
    // Find user
    const user = await (await import('../models/user.model.js')).default.findById(tokenData.userId);
    
    if (!user) {
      refreshTokens.delete(refreshToken);
      return null;
    }
    
    // Generate new access token
    const payload = user.getJwtPayload();
    const accessToken = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
    
    // Generate new refresh token
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    
    // Remove old refresh token
    refreshTokens.delete(refreshToken);
    
    // Store new refresh token
    refreshTokens.set(newRefreshToken, {
      userId: user._id.toString(),
      expiresAt: Date.now() + (parseInt(config.jwt.refreshExpiresIn) * 1000)
    });
    
    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    logger.error('Refresh access token error:', error);
    throw error;
  }
};

// Remove refresh token (logout)
const removeRefreshToken = async (refreshToken) => {
  try {
    refreshTokens.delete(refreshToken);
    return true;
  } catch (error) {
    logger.error('Remove refresh token error:', error);
    throw error;
  }
};

// Verify access token
const verifyAccessToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    logger.error('Verify access token error:', error);
    return null;
  }
};

export default {
  generateTokens,
  refreshAccessToken,
  removeRefreshToken,
  verifyAccessToken
};