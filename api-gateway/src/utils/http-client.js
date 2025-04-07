import axios from 'axios';
import logger from './logger.js';

// Create axios instance with default config
const httpClient = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for logging
httpClient.interceptors.request.use(
  (config) => {
    logger.info(`HTTP Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('HTTP Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for logging
httpClient.interceptors.response.use(
  (response) => {
    logger.info(`HTTP Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`HTTP Response Error: ${error.response.status} ${error.config.method.toUpperCase()} ${error.config.url}`);
    } else if (error.request) {
      logger.error(`HTTP Request Failed: ${error.config.method.toUpperCase()} ${error.config.url}`);
    } else {
      logger.error('HTTP Client Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default httpClient;