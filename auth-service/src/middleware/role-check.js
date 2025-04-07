import Role from '../models/role.model.js';
import logger from '../utils/logger.js';

// Check if user has specific permission for resource and action
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      
      // Admin role has full access
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get user's role
      const role = await Role.findOne({ name: req.user.role });
      
      if (!role) {
        return res.status(403).json({ message: 'Access denied. Role not found.' });
      }
      
      // Check if role has permission
      if (!role.hasPermission(resource, action)) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      
      next();
    } catch (error) {
      logger.error('Check permission error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Check if user has ownership of a resource
const checkOwnership = (resourceModel, resourceIdParam) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      
      // Admin has full access
      if (req.user.role === 'admin') {
        return next();
      }
      
      const resourceId = req.params[resourceIdParam];
      
      // Get the resource
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      // Check if user owns the resource
      // Note: This assumes the resource has a userId or createdBy field
      if (resource.userId?.toString() !== req.user.id && 
          resource.createdBy?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. Not the owner.' });
      }
      
      next();
    } catch (error) {
      logger.error('Check ownership error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export default {
  checkPermission,
  checkOwnership
};