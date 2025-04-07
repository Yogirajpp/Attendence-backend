import collegeService from '../services/college.service.js';
import logger from '../utils/logger.js';

// Get all colleges with pagination and filtering
const getAllColleges = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, companyId, search, isActive } = req.query;
    
    // Create filter object
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const colleges = await collegeService.getAllColleges(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter,
      search
    );
    
    return res.status(200).json(colleges);
  } catch (error) {
    logger.error('Get all colleges error:', error);
    next(error);
  }
};

// Get college by ID
const getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const college = await collegeService.getCollegeById(id);
    
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    return res.status(200).json({ college });
  } catch (error) {
    logger.error('Get college by ID error:', error);
    next(error);
  }
};

// Create a new college
const createCollege = async (req, res, next) => {
  try {
    // Add creator info from authenticated user
    const collegeData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const college = await collegeService.createCollege(collegeData);
    
    return res.status(201).json({
      message: 'College created successfully',
      college
    });
  } catch (error) {
    logger.error('Create college error:', error);
    next(error);
  }
};

// Update college
const updateCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Add updater info from authenticated user
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const updatedCollege = await collegeService.updateCollege(id, updateData);
    
    if (!updatedCollege) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    return res.status(200).json({
      message: 'College updated successfully',
      college: updatedCollege
    });
  } catch (error) {
    logger.error('Update college error:', error);
    next(error);
  }
};

// Delete college
const deleteCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await collegeService.deleteCollege(id);
    
    if (!result) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    return res.status(200).json({
      message: 'College deleted successfully'
    });
  } catch (error) {
    logger.error('Delete college error:', error);
    next(error);
  }
};

// Get colleges by company ID
const getCollegesByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, isActive } = req.query;
    
    // Create filter object
    const filter = { companyId };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const colleges = await collegeService.getAllColleges(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(colleges);
  } catch (error) {
    logger.error('Get colleges by company error:', error);
    next(error);
  }
};

// Upload college logo
const uploadCollegeLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const logoUrl = req.file.path; // Assuming file upload middleware
    
    const updatedCollege = await collegeService.updateCollegeLogo(id, logoUrl, req.user.id);
    
    if (!updatedCollege) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    return res.status(200).json({
      message: 'College logo updated successfully',
      logo: updatedCollege.logo
    });
  } catch (error) {
    logger.error('Upload college logo error:', error);
    next(error);
  }
};

export default {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  getCollegesByCompany,
  uploadCollegeLogo
};