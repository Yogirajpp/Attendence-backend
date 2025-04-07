import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

// Create rate limiters for different types of routes
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const qrLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many QR code requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  standardLimiter,
  authLimiter,
  qrLimiter
};