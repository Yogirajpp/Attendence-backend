import Department from '../models/department.model.js';
import logger from '../utils/logger.js';

// Get all departments with pagination and filtering
const getAllDepartments = async (page, limit, filter = {}, search = null) => {
  try {
    const skip = (page - 1) * limit;
    
    let query = Department.find(filter);
    
    // Add search functionality if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.or([
        { name: { $regex: searchRegex } },
        { code: { $regex: searchRegex } }
      ]);
    }
    
    // Get departments with pagination
    const departments = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('collegeId', 'name code')
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await Department.countDocuments(
      search ? query.getFilter() : filter
    );
    
    return {
      departments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all departments service error:', error);
    throw error;
  }
};

// Get department by ID
const getDepartmentById = async (id) => {
  try {
    return await Department.findById(id)
      .populate('collegeId', 'name code')
      .select('-__v')
      .lean();
  } catch (error) {
    logger.error('Get department by ID service error:', error);
    throw error;
  }
};

// Create a new department
const createDepartment = async (departmentData) => {
  try {
    // Create new department
    const department = new Department(departmentData);
    await department.save();
    
    // Return populated department
    return await getDepartmentById(department._id);
  } catch (error) {
    logger.error('Create department service error:', error);
    throw error;
  }
};

// Update department
const updateDepartment = async (id, updateData) => {
  try {
    await Department.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true }
    );
    
    // Return updated department with populated fields
    return await getDepartmentById(id);
  } catch (error) {
    logger.error('Update department service error:', error);
    throw error;
  }
};

// Delete department
const deleteDepartment = async (id) => {
  try {
    const result = await Department.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete department service error:', error);
    throw error;
  }
};

// Assign head of department
const assignHeadOfDepartment = async (id, headOfDepartment, updatedBy) => {
  try {
    await Department.findByIdAndUpdate(
      id,
      { 
        headOfDepartment,
        updatedBy
      },
      { runValidators: true }
    );
    
    // Return updated department with populated fields
    return await getDepartmentById(id);
  } catch (error) {
    logger.error('Assign head of department service error:', error);
    throw error;
  }
};

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHeadOfDepartment
};