import logger from '../utils/logger.js';

// Middleware to log all requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  logger.info(`Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: req.headers
  });
  
  // Log response details when response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`Response: ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      headers: res.getHeaders()
    });
  });
  
  next();
};

export default requestLogger;