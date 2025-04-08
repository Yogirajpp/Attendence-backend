import validationService from '../services/validation.service.js';
import logger from '../utils/logger.js';

// Validate a QR code
const validateQRCode = async (req, res, next) => {
  try {
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ message: 'QR code value is required' });
    }
    
    const result = await validationService.validateQRCode(value);
    
    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      valid: true,
      message: 'QR code is valid',
      payload: result.payload,
      type: result.type
    });
  } catch (error) {
    logger.error('Validate QR code error:', error);
    next(error);
  }
};

// Validate and process attendance QR code
const validateAttendanceQR = async (req, res, next) => {
  try {
    const { 
      value, 
      studentId, 
      biometricToken, 
      deviceInfo 
    } = req.body;
    
    if (!value || !studentId) {
      return res.status(400).json({ 
        message: 'QR code value and Student ID are required' 
      });
    }
    
    const result = await validationService.validateAttendanceQR(
      value, 
      studentId, 
      biometricToken, 
      deviceInfo
    );
    
    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      valid: true,
      message: 'Attendance recorded successfully',
      sessionId: result.sessionId,
      timestamp: result.timestamp
    });
  } catch (error) {
    logger.error('Validate attendance QR error:', error);
    next(error);
  }
};

// Validate and process access QR code
const validateAccessQR = async (req, res, next) => {
  try {
    const { 
      value, 
      locationId, 
      requiredPermissions, 
      deviceInfo 
    } = req.body;
    
    if (!value || !locationId) {
      return res.status(400).json({ 
        message: 'QR code value and Location ID are required' 
      });
    }
    
    const result = await validationService.validateAccessQR(
      value, 
      locationId, 
      requiredPermissions, 
      deviceInfo
    );
    
    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      valid: true,
      message: 'Access granted',
      userId: result.userId,
      permissions: result.permissions,
      timestamp: result.timestamp
    });
  } catch (error) {
    logger.error('Validate access QR error:', error);
    next(error);
  }
};

// Get information from a QR code
const getInfoFromQR = async (req, res, next) => {
  try {
    const { value } = req.params;
    
    if (!value) {
      return res.status(400).json({ message: 'QR code value is required' });
    }
    
    const result = await validationService.getInfoFromQR(value);
    
    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      valid: true,
      info: result.info
    });
  } catch (error) {
    logger.error('Get info from QR error:', error);
    next(error);
  }
};

// Check if a QR code is valid without processing it
const checkQRValidity = async (req, res, next) => {
  try {
    const { value } = req.query;
    
    if (!value) {
      return res.status(400).json({ message: 'QR code value is required' });
    }
    
    const result = await validationService.checkQRValidity(value);
    
    return res.status(200).json({
      valid: result.valid,
      message: result.message,
      type: result.type
    });
  } catch (error) {
    logger.error('Check QR validity error:', error);
    next(error);
  }
};

export default {
  validateQRCode,
  validateAttendanceQR,
  validateAccessQR,
  getInfoFromQR,
  checkQRValidity
};