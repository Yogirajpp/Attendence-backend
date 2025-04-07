import dotenv from 'dotenv';
dotenv.config();

export default {
  // Server configuration
  port: process.env.PORT || 3002,
  environment: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/user-service',
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
  
  // File uploads
  uploads: {
    profilePictures: {
      path: process.env.PROFILE_PICTURES_PATH || 'uploads/profile-pictures',
      maxSize: process.env.PROFILE_PICTURE_MAX_SIZE || 1024 * 1024 * 2, // 2MB
      allowedFormats: ['image/jpeg', 'image/png', 'image/gif']
    }
  }
};