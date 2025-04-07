import dotenv from 'dotenv';
dotenv.config();

export default {
  // Server configuration
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  
  // Service URLs
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    college: process.env.COLLEGE_SERVICE_URL || 'http://localhost:3003',
    attendance: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:3004',
    qr: process.env.QR_SERVICE_URL || 'http://localhost:3005',
    biometric: process.env.BIOMETRIC_SERVICE_URL || 'http://localhost:3006',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3008',
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3009'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100 // limit each IP to 100 requests per windowMs
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};