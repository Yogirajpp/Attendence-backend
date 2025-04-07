import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import config from './config/index.js';
import collegeRoutes from './routes/college.routes.js';
import departmentRoutes from './routes/department.routes.js';
import courseRoutes from './routes/course.routes.js';
import classRoutes from './routes/class.routes.js';
import errorHandler from './middleware/error-handler.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'college-service' });
});

// Routes
app.use('/api/colleges', collegeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classes', classRoutes);

// Database connection
mongoose.connect(config.database.url, config.database.options)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

const PORT = config.port || 3003;

app.listen(PORT, () => {
  logger.info(`College Service listening on port ${PORT}`);
});

export default app;