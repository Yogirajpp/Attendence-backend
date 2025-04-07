import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import authMiddleware from './middleware/auth.js';
import errorHandler from './middleware/error-handler.js';
import requestLogger from './middleware/request-logger.js';
import config from './config/index.js';
import routes from './routes/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Routes
app.use('/api', routes);

// Service proxies
const serviceProxy = (serviceName, serviceUrl) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: '',
    },
    logLevel: 'silent'
  });
};

// Apply proxies for each service
app.use('/api/auth', serviceProxy('auth', config.services.auth));
app.use('/api/users', serviceProxy('users', config.services.user));
app.use('/api/colleges', serviceProxy('colleges', config.services.college));
app.use('/api/attendance', serviceProxy('attendance', config.services.attendance));
app.use('/api/qr', serviceProxy('qr', config.services.qr));
app.use('/api/biometric', serviceProxy('biometric', config.services.biometric));
app.use('/api/notifications', serviceProxy('notifications', config.services.notification));
app.use('/api/analytics', serviceProxy('analytics', config.services.analytics));
app.use('/api/admin', serviceProxy('admin', config.services.admin));

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
});

export default app;