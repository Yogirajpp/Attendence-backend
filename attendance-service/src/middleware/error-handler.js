import logger from '../utils/logger.js';

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate key error',
      field: Object.keys(err.keyValue)[0]
    });
  }
  
  // Handle cast errors (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      field: err.path
    });
  }
  
  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;