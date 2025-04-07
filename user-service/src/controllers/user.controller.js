import userService from '../services/user.service.js';
import logger from '../utils/logger.js';

// Get all users with pagination and filtering
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, collegeId, companyId, search, isActive } = req.query;
    
    // Create filter object
    const filter = {};
    if (role) filter.role = role;
    if (collegeId) filter.collegeId = collegeId;
    if (companyId) filter.companyId = companyId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await userService.getAllUsers(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(users);
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ user });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
};

// Create a new user
const createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    
    const user = await userService.createUser(userData);
    
    return res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedUser = await userService.updateUser(id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await userService.deleteUser(id);
    
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

// Get user profile
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT token
    
    const user = await userService.getUserByAuthId(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    return res.status(200).json({ user });
  } catch (error) {
    logger.error('Get user profile error:', error);
    next(error);
  }
};

// Update user profile
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT token
    const updateData = req.body;
    
    const user = await userService.getUserByAuthId(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    // Only allow updating certain fields for own profile
    const allowedFields = ['name', 'phone', 'address', 'dateOfBirth', 'gender', 'profilePicture'];
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});
    
    const updatedUser = await userService.updateUser(user._id, filteredData);
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    next(error);
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT token
    const imageUrl = req.file.path; // Assuming file upload middleware
    
    const user = await userService.getUserByAuthId(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    const updatedUser = await userService.updateUser(user._id, { profilePicture: imageUrl });
    
    return res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    logger.error('Upload profile picture error:', error);
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture
};