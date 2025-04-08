import dotenv from 'dotenv';
dotenv.config();

export default {
  // Server configuration
  port: process.env.PORT || 3005,
  environment: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT configuration (for validating tokens from Auth service)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-key'
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
  },
  
  // QR Code
  qr: {
    defaultExpiry: process.env.QR_DEFAULT_EXPIRY || 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    attendanceExpiry: process.env.QR_ATTENDANCE_EXPIRY || 4000, // 4 seconds in milliseconds
    cleanupInterval: process.env.QR_CLEANUP_INTERVAL || 60 * 60 * 1000 // 1 hour in milliseconds
  },
  
  // Encryption
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc',
    key: process.env.ENCRYPTION_KEY, // 32 bytes hex encoded
    iv: process.env.ENCRYPTION_IV // 16 bytes hex encoded
  },
  
  // Services
  services: {
    attendance: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:3004',
    biometric: process.env.BIOMETRIC_SERVICE_URL || 'http://localhost:3006',
    internalApiKey: process.env.INTERNAL_API_KEY || 'default-internal-key'
  }
};