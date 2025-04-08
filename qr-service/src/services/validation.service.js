import QR from '../models/qr.model.js';
import qrService from './qr.service.js';
import encryption from '../utils/encryption.js';
import axios from 'axios';
import logger from '../utils/logger.js';
import config from '../config/index.js';

// Validate a QR code
const validateQRCode = async (value) => {
  try {
    // Find the QR code in the database
    const qrCode = await qrService.getQRCodeByValue(value);
    
    if (!qrCode) {
      return {
        valid: false,
        message: 'QR code not found'
      };
    }
    
    // Check if the QR code is valid
    if (!qrCode.isValid()) {
      let message = 'Invalid QR code';
      
      if (!qrCode.isActive) {
        message = 'QR code is inactive';
      } else if (qrCode.expiresAt < new Date()) {
        message = 'QR code has expired';
      } else if (qrCode.usageCount >= qrCode.maxUsage && qrCode.maxUsage > 0) {
        message = 'QR code has reached its usage limit';
      }
      
      return {
        valid: false,
        message
      };
    }
    
    // Decrypt the payload
    const payloadStr = encryption.decrypt(qrCode.encryptedData);
    const payload = JSON.parse(payloadStr);
    
    // Mark the QR code as used
    await qrCode.markAsUsed();
    
    return {
      valid: true,
      message: 'QR code is valid',
      payload,
      type: qrCode.type
    };
  } catch (error) {
    logger.error('Validate QR code service error:', error);
    
    return {
      valid: false,
      message: 'Error validating QR code'
    };
  }
};

// Validate attendance QR code
const validateAttendanceQR = async (value, studentId, biometricToken, deviceInfo) => {
  try {
    // Validate the QR code first
    const validationResult = await validateQRCode(value);
    
    if (!validationResult.valid) {
      return validationResult;
    }
    
    // Verify it's an attendance QR code
    if (validationResult.type !== 'attendance') {
      return {
        valid: false,
        message: 'Not an attendance QR code'
      };
    }
    
    const payload = validationResult.payload;
    
    // Verify biometric token if provided
    let biometricVerified = false;
    
    if (biometricToken) {
      try {
        // Call biometric service to verify token
        const biometricVerification = await axios.post(
          `${config.services.biometric}/api/verification/verify`,
          {
            token: biometricToken,
            userId: studentId
          }
        );
        
        biometricVerified = biometricVerification.data.verified;
      } catch (error) {
        logger.error('Biometric verification error:', error);
        // Continue with QR verification even if biometric fails
      }
    }
    
    // Record attendance in the attendance service
    try {
      await axios.post(
        `${config.services.attendance}/api/attendance/mark`,
        {
          sessionId: payload.sessionId,
          studentId,
          status: 'present',
          qrVerified: true,
          biometricVerified,
          verificationMethod: biometricVerified ? 'biometric' : 'qr',
          device: deviceInfo?.device,
          ipAddress: deviceInfo?.ipAddress
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.services.internalApiKey}`
          }
        }
      );
      
      return {
        valid: true,
        message: 'Attendance recorded successfully',
        sessionId: payload.sessionId,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Attendance recording error:', error);
      
      return {
        valid: false,
        message: 'Failed to record attendance',
        error: error.response?.data?.message || error.message
      };
    }
  } catch (error) {
    logger.error('Validate attendance QR service error:', error);
    
    return {
      valid: false,
      message: 'Error validating attendance QR code'
    };
  }
};

// Validate access QR code
const validateAccessQR = async (value, locationId, requiredPermissions = [], deviceInfo) => {
  try {
    // Validate the QR code first
    const validationResult = await validateQRCode(value);
    
    if (!validationResult.valid) {
      return validationResult;
    }
    
    // Verify it's an access QR code
    if (validationResult.type !== 'access') {
      return {
        valid: false,
        message: 'Not an access QR code'
      };
    }
    
    const payload = validationResult.payload;
    
    // Check if the QR code is for the requested location
    if (payload.locationId !== locationId) {
      return {
        valid: false,
        message: 'QR code is not valid for this location'
      };
    }
    
    // Check if the user has required permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = payload.permissions || [];
      
      const hasPermission = requiredPermissions.every(
        permission => userPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        return {
          valid: false,
          message: 'Insufficient permissions'
        };
      }
    }
    
    // Log access attempt
    try {
      // In a real system, you would log this to a separate service
      logger.info('Access granted', {
        userId: payload.userId,
        locationId,
        permissions: payload.permissions,
        timestamp: new Date(),
        deviceInfo
      });
    } catch (error) {
      logger.error('Access logging error:', error);
      // Continue even if logging fails
    }
    
    return {
      valid: true,
      message: 'Access granted',
      userId: payload.userId,
      permissions: payload.permissions,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error('Validate access QR service error:', error);
    
    return {
      valid: false,
      message: 'Error validating access QR code'
    };
  }
};

// Get information from QR code
const getInfoFromQR = async (value) => {
    try {
      // Validate the QR code first
      const validationResult = await validateQRCode(value);
      
      if (!validationResult.valid) {
        return validationResult;
      }
      
      // Verify it's an information QR code
      if (validationResult.type !== 'information') {
        return {
          valid: false,
          message: 'Not an information QR code'
        };
      }
      
      const payload = validationResult.payload;
      
      return {
        valid: true,
        info: {
          title: payload.title,
          content: payload.content,
          url: payload.url
        }
      };
    } catch (error) {
      logger.error('Get info from QR service error:', error);
      
      return {
        valid: false,
        message: 'Error getting information from QR code'
      };
    }
  };
  
  // Check QR validity without processing
  const checkQRValidity = async (value) => {
    try {
      // Find the QR code in the database
      const qrCode = await qrService.getQRCodeByValue(value);
      
      if (!qrCode) {
        return {
          valid: false,
          message: 'QR code not found'
        };
      }
      
      // Check if the QR code is valid
      if (!qrCode.isValid()) {
        let message = 'Invalid QR code';
        
        if (!qrCode.isActive) {
          message = 'QR code is inactive';
        } else if (qrCode.expiresAt < new Date()) {
          message = 'QR code has expired';
        } else if (qrCode.usageCount >= qrCode.maxUsage && qrCode.maxUsage > 0) {
          message = 'QR code has reached its usage limit';
        }
        
        return {
          valid: false,
          message,
          type: qrCode.type
        };
      }
      
      return {
        valid: true,
        message: 'QR code is valid',
        type: qrCode.type
      };
    } catch (error) {
      logger.error('Check QR validity service error:', error);
      
      return {
        valid: false,
        message: 'Error checking QR code validity'
      };
    }
  };
  
  export default {
    validateQRCode,
    validateAttendanceQR,
    validateAccessQR,
    getInfoFromQR,
    checkQRValidity
  };