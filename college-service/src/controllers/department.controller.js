import departmentService from '../services/department.service.js';
import logger from '../utils/logger.js';

// Get all departments with pagination and filtering
const getAllDepartments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, collegeId, search, isActive } = req.query;
    
    // Create filter object
    const filter = {};
    if (collegeId) filter.collegeId = collegeId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const departments = await departmentService.getAllDepartments(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter,
      search
    );
    
    return res.status(200).json(departments);
  } catch (error) {
    logger.error('Get all departments error:', error);
    next(error);
  }
};

// Get department by ID
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const department = await departmentService.getDepartmentById(id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    return res.status(200).json({ department });
  } catch (error) {
    logger.error('Get department by ID error:', error);
    next(error);
  }
};

// Create a new department
const createDepartment = async (req, res, next) => {
  try {
    // Add creator info from authenticated user
    const departmentData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const department = await departmentService.createDepartment(departmentData);
    
    return res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    logger.error('Create department error:', error);
    next(error);
  }
};

// Update department
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Add updater info from authenticated user
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const updatedDepartment = await departmentService.updateDepartment(id, updateData);
    
    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    return res.status(200).json({
      message: 'Department updated successfully',
      department: updatedDepartment
    });
  } catch (error) {
    logger.error('Update department error:', error);
    next(error);
  }
};

// Delete department
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await departmentService.deleteDepartment(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    return res.status(200).json({
      message: 'Department deleted successfully'
    });
  } catch (error) {
    logger.error('Delete department error:', error);
    next(error);
  }
};

// Get departments by college ID
const getDepartmentsByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const { page = 1, limit = 10, isActive } = req.query;
    
    // Create filter object
    const filter = { collegeId };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const departments = await departmentService.getAllDepartments(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(departments);
  } catch (error) {
    logger.error('Get departments by college error:', error);
    next(error);
  }
};

// Assign head of department
const assignHeadOfDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, userId } = req.body;
    
    if (!name || !email || !phone || !userId) {
      return res.status(400).json({ 
        message: 'Head of department details are required (name, email, phone, userId)' 
      });
    }
    
    const headOfDepartment = { name, email, phone, userId };
    
    const updatedDepartment = await departmentService.assignHeadOfDepartment(
      id, 
      headOfDepartment, 
      req.user.id
    );
    
    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    return res.status(200).json({
      message: 'Head of department assigned successfully',
      department: updatedDepartment
    });
  } catch (error) {
    logger.error('Assign head of department error:', error);
    next(error);
  }
};

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByCollege,
  assignHeadOfDepartment
};