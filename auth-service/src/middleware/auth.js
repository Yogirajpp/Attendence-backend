import tokenService from '../services/token.service.js';
import logger from '../utils/logger.js';

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }
    
    const decoded = await tokenService.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check user roles middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

export default {
  verifyToken,
  checkRole
};