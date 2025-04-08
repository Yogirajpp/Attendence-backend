import qrcode from 'qrcode';
import crypto from 'crypto';
import QR from '../models/qr.model.js';
import logger from './logger.js';

// Generate a unique QR code value
const generateUniqueQRValue = async () => {
  try {
    let isUnique = false;
    let qrValue;
    
    // Keep generating until we find a unique value
    while (!isUnique) {
      // Generate a random string
      qrValue = crypto.randomBytes(16).toString('hex');
      
      // Check if it already exists in the database
      const existingQR = await QR.findOne({ value: qrValue });
      
      if (!existingQR) {
        isUnique = true;
      }
    }
    
    return qrValue;
  } catch (error) {
    logger.error('Generate unique QR value error:', error);
    throw error;
  }
};

// Generate QR code image as PNG buffer
const generateQRImage = async (value, size = 200, margin = 4, errorCorrectionLevel = 'M') => {
  try {
    const options = {
      errorCorrectionLevel,
      type: 'png',
      width: size,
      margin,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };
    
    // Generate QR code as buffer
    return await qrcode.toBuffer(value, options);
  } catch (error) {
    logger.error('Generate QR image error:', error);
    throw error;
  }
};

// Generate QR code as data URL
const generateQRDataURL = async (value, size = 200, margin = 4, errorCorrectionLevel = 'M') => {
  try {
    const options = {
      errorCorrectionLevel,
      width: size,
      margin,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };
    
    // Generate QR code as data URL
    return await qrcode.toDataURL(value, options);
  } catch (error) {
    logger.error('Generate QR data URL error:', error);
    throw error;
  }
};

// Generate QR code as SVG string
const generateQRSVG = async (value, size = 200, margin = 4, errorCorrectionLevel = 'M') => {
  try {
    const options = {
      errorCorrectionLevel,
      type: 'svg',
      width: size,
      margin,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };
    
    // Generate QR code as SVG string
    return await qrcode.toString(value, options);
  } catch (error) {
    logger.error('Generate QR SVG error:', error);
    throw error;
  }
};

export default {
  generateUniqueQRValue,
  generateQRImage,
  generateQRDataURL,
  generateQRSVG
};