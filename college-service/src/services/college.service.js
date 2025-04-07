import College from '../models/college.model.js';
import logger from '../utils/logger.js';

// Get all colleges with pagination and filtering
const getAllColleges = async (page, limit, filter = {}, search = null) => {
  try {
    const skip = (page - 1) * limit;
    
    let query = College.find(filter);
    
    // Add search functionality if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.or([
        { name: { $regex: searchRegex } },
        { code: { $regex: searchRegex } }
      ]);
    }
    
    // Get colleges with pagination
    const colleges = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await College.countDocuments(
      search ? query.getFilter() : filter
    );
    
    return {
      colleges,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all colleges service error:', error);
    throw error;
  }
};

// Get college by ID
const getCollegeById = async (id) => {
  try {
    return await College.findById(id).select('-__v').lean();
  } catch (error) {
    logger.error('Get college by ID service error:', error);
    throw error;
  }
};

// Create a new college
const createCollege = async (collegeData) => {
  try {
    // Create new college
    const college = new College(collegeData);
    await college.save();
    
    return college.toObject();
  } catch (error) {
    logger.error('Create college service error:', error);
    throw error;
  }
};

// Update college
const updateCollege = async (id, updateData) => {
  try {
    const college = await College.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v').lean();
    
    return college;
  } catch (error) {
    logger.error('Update college service error:', error);
    throw error;
  }
};

// Delete college
const deleteCollege = async (id) => {
  try {
    const result = await College.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete college service error:', error);
    throw error;
  }
};

// Update college logo
const updateCollegeLogo = async (id, logoUrl, updatedBy) => {
  try {
    const college = await College.findByIdAndUpdate(
      id,
      { 
        logo: logoUrl,
        updatedBy
      },
      { new: true, runValidators: true }
    ).select('-__v').lean();
    
    return college;
  } catch (error) {
    logger.error('Update college logo service error:', error);
    throw error;
  }
};

export default {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  updateCollegeLogo
};