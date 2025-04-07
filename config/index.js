import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
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
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@attendance-system.com'
  },
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  qr: {
    expirySeconds: process.env.QR_EXPIRY_SECONDS || 4,
    encryptionKey: process.env.QR_ENCRYPTION_KEY || 'default-encryption-key'
  }
};