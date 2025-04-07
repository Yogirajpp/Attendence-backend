import winston from 'winston';
import config from '../config/index.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create a Winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Write logs with level 'error' and below to error.log
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;