import User from '../models/user.model.js';
import logger from '../utils/logger.js';
import tokenUtils from '../utils/token.util.js';
import passwordUtils from '../utils/password.util.js';

// Authenticate a user with email and password
const authenticate = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      return null;
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error('Authentication error:', error);
    throw error;
  }
};

// Generate password reset token
const generateResetToken = async (email) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not
      return null;
    }
    
    // Generate reset token
    const resetToken = tokenUtils.generateRandomToken();
    
    // Set token and expiry (24 hours)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;
    
    await user.save();
    
    // In a real application, send email with reset link
    // ...
    
    return resetToken;
  } catch (error) {
    logger.error('Generate reset token error:', error);
    throw error;
  }
};

// Reset password using token
const resetPassword = async (token, newPassword) => {
  try {
    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return false;
    }
    
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    return true;
  } catch (error) {
    logger.error('Reset password error:', error);
    throw error;
  }
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return false;
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return false;
    }
    
    // Update password
    user.password = newPassword;
    
    await user.save();
    
    return true;
  } catch (error) {
    logger.error('Change password error:', error);
    throw error;
  }
};

export default {
  authenticate,
  generateResetToken,
  resetPassword,
  changePassword
};