import Role from '../models/role.model.js';
import logger from '../utils/logger.js';

// Create a new role
const createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(409).json({ message: 'Role already exists' });
    }
    
    // Create new role
    const role = new Role({
      name,
      description,
      permissions,
      isSystem: false
    });
    
    await role.save();
    
    return res.status(201).json({
      message: 'Role created successfully',
      role: {
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem
      }
    });
  } catch (error) {
    logger.error('Create role error:', error);
    next(error);
  }
};

// Get all roles
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    
    return res.status(200).json({
      roles: roles.map(role => ({
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem
      }))
    });
  } catch (error) {
    logger.error('Get all roles error:', error);
    next(error);
  }
};

// Get role by ID
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    return res.status(200).json({
      role: {
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem
      }
    });
  } catch (error) {
    logger.error('Get role by ID error:', error);
    next(error);
  }
};

// Update role
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    // Find role
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Prevent updating system roles
    if (role.isSystem) {
      return res.status(403).json({ message: 'System roles cannot be modified' });
    }
    
    // Update role
    if (name) role.name = name;
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;
    
    await role.save();
    
    return res.status(200).json({
      message: 'Role updated successfully',
      role: {
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem
      }
    });
  } catch (error) {
    logger.error('Update role error:', error);
    next(error);
  }
};

// Delete role
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find role
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({ message: 'System roles cannot be deleted' });
    }
    
    await role.deleteOne();
    
    return res.status(200).json({
      message: 'Role deleted successfully'
    });
  } catch (error) {
    logger.error('Delete role error:', error);
    next(error);
  }
};

export default {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
};