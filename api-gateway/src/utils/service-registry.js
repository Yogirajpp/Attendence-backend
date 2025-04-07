import axios from 'axios';
import logger from './logger.js';
import config from '../config/index.js';

class ServiceRegistry {
  constructor() {
    this.services = config.services;
    this.healthCheckInterval = 60000; // Check services every minute
    this.initHealthChecks();
  }

  // Get service URL
  getServiceUrl(serviceName) {
    return this.services[serviceName];
  }

  // Initialize health check interval
  initHealthChecks() {
    setInterval(() => {
      this.checkServicesHealth();
    }, this.healthCheckInterval);
    
    // Run an immediate check at startup
    this.checkServicesHealth();
  }

  // Check health of all services
  async checkServicesHealth() {
    logger.info('Checking services health');
    
    const serviceNames = Object.keys(this.services);
    
    for (const serviceName of serviceNames) {
      try {
        const serviceUrl = this.services[serviceName];
        const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
        
        if (response.status === 200 && response.data.status === 'UP') {
          logger.info(`Service ${serviceName} is healthy`);
        } else {
          logger.warn(`Service ${serviceName} has reported unhealthy status: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        logger.error(`Service ${serviceName} health check failed:`, error.message);
      }
    }
  }
}

// Create a singleton instance
const serviceRegistry = new ServiceRegistry();

export default serviceRegistry;