import User from '../models/user.model.js';
import authService from '../services/auth.service.js';
import tokenService from '../services/token.service.js';
import logger from '../utils/logger.js';

// Register a new user
const register = async (req, res, next) => {
  try {
    const { email, password, name, role, collegeId, companyId } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    // Create new user
    const userData = {
      email,
      password,
      name,
      role: role || 'student'
    };
    
    // Add optional fields if provided
    if (collegeId) userData.collegeId = collegeId;
    if (companyId) userData.companyId = companyId;
    
    const user = new User(userData);
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = await tokenService.generateTokens(user);
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// User login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user and authenticate
    const user = await authService.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = await tokenService.generateTokens(user);
    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token and generate new tokens
    const tokens = await tokenService.refreshAccessToken(refreshToken);
    
    if (!tokens) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    return res.status(200).json({
      message: 'Token refreshed successfully',
      tokens
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Remove refresh token
    await tokenService.removeRefreshToken(refreshToken);
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Request password reset
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Generate reset token (this would normally send an email)
    const resetToken = await authService.generateResetToken(email);
    
    // For security, don't reveal if email exists or not
    return res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link shortly',
      // In development, return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// Reset password with token
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    // Reset password using token
    const success = await authService.resetPassword(token, newPassword);
    
    if (!success) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        collegeId: user.collegeId,
        companyId: user.companyId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    // Create update object with allowed fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Change user password
    const success = await authService.changePassword(userId, currentPassword, newPassword);
    
    if (!success) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword
};