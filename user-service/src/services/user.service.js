import User from '../models/user.model.js';
import logger from '../utils/logger.js';
import userUtil from '../utils/user.util.js';

// Get all users with pagination and filtering
const getAllUsers = async (page, limit, filter = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all users service error:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    return await User.findById(id).select('-__v').lean();
  } catch (error) {
    logger.error('Get user by ID service error:', error);
    throw error;
  }
};

// Get user by Auth service ID
const getUserByAuthId = async (userId) => {
  try {
    return await User.findOne({ userId }).select('-__v').lean();
  } catch (error) {
    logger.error('Get user by Auth ID service error:', error);
    throw error;
  }
};

// Create a new user
const createUser = async (userData) => {
  try {
    // Create new user
    const user = new User(userData);
    await user.save();
    
    return user.toObject();
  } catch (error) {
    logger.error('Create user service error:', error);
    throw error;
  }
};

// Update user
const updateUser = async (id, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v').lean();
    
    return user;
  } catch (error) {
    logger.error('Update user service error:', error);
    throw error;
  }
};

// Delete user
const deleteUser = async (id) => {
  try {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete user service error:', error);
    throw error;
  }
};

// Search users
const searchUsers = async (query, filter = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    // Create search filter
    const searchFilter = {
      ...filter,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Get users with pagination
    const users = await User.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await User.countDocuments(searchFilter);
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Search users service error:', error);
    throw error;
  }
};

// Get users by role
const getUsersByRole = async (role, page = 1, limit = 10, filter = {}) => {
    try {
      const skip = (page - 1) * limit;
      
      // Combine role with additional filters
      const combinedFilter = {
        ...filter,
        role
      };
      
      // Get users with pagination
      const users = await User.find(combinedFilter)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean();
      
      // Get total count for pagination
      const total = await User.countDocuments(combinedFilter);
      
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get users by role service error:', error);
      throw error;
    }
  };
  
  // Get users by college
  const getUsersByCollege = async (collegeId, page = 1, limit = 10, filter = {}) => {
    try {
      const skip = (page - 1) * limit;
      
      // Combine collegeId with additional filters
      const combinedFilter = {
        ...filter,
        collegeId
      };
      
      // Get users with pagination
      const users = await User.find(combinedFilter)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean();
      
      // Get total count for pagination
      const total = await User.countDocuments(combinedFilter);
      
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get users by college service error:', error);
      throw error;
    }
  };
  
  // Get user IDs by criteria (used by other services)
  const getUserIdsByCriteria = async (criteria) => {
    try {
      const users = await User.find(criteria).select('_id').lean();
      return users.map(user => user._id);
    } catch (error) {
      logger.error('Get user IDs by criteria service error:', error);
      throw error;
    }
  };
  
  export default {
    getAllUsers,
    getUserById,
    getUserByAuthId,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersByRole,
    getUsersByCollege,
    getUserIdsByCriteria
  };