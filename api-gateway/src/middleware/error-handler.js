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
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Create response body
  const errorResponse = {
    message: statusCode === 500 ? 'Internal server error' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  // Send response
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;