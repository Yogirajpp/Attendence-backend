import QR from '../models/qr.model.js';
import qrGenerator from '../utils/qr-generator.js';
import encryption from '../utils/encryption.js';
import logger from '../utils/logger.js';

// Generate a new QR code
const generateQRCode = async (qrData) => {
  try {
    // Encrypt the payload
    const encryptedData = encryption.encrypt(
      JSON.stringify(qrData.payload)
    );
    
    // Calculate expiry time
    const expiryTime = qrData.expiryTime 
      ? (typeof qrData.expiryTime === 'number' 
          ? new Date(Date.now() + qrData.expiryTime) 
          : new Date(qrData.expiryTime))
      : new Date(Date.now() + (24 * 60 * 60 * 1000)); // Default 24 hours
    
    // Generate a unique QR value
    const qrValue = await qrGenerator.generateUniqueQRValue();
    
    // Create and save the QR code in the database
    const qrCode = new QR({
      value: qrValue,
      payload: qrData.payload,
      type: qrData.type,
      encryptedData,
      createdFor: qrData.createdFor,
      createdBy: qrData.createdBy,
      expiresAt: expiryTime,
      maxUsage: qrData.maxUsage || 1
    });
    
    await qrCode.save();
    
    return qrCode;
  } catch (error) {
    logger.error('Generate QR code service error:', error);
    throw error;
  }
};

// Get QR code by ID
const getQRCodeById = async (id) => {
  try {
    return await QR.findById(id);
  } catch (error) {
    logger.error('Get QR code by ID service error:', error);
    throw error;
  }
};

// Get QR code by value
const getQRCodeByValue = async (value) => {
  try {
    return await QR.findOne({ value });
  } catch (error) {
    logger.error('Get QR code by value service error:', error);
    throw error;
  }
};

// Deactivate a QR code
const deactivateQRCode = async (id) => {
  try {
    const qrCode = await QR.findById(id);
    
    if (!qrCode) {
      return null;
    }
    
    qrCode.isActive = false;
    await qrCode.save();
    
    return qrCode;
  } catch (error) {
    logger.error('Deactivate QR code service error:', error);
    throw error;
  }
};

// Get QR codes by criteria with pagination
const getQRCodes = async (page, limit, filter = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get QR codes with pagination
    const qrCodes = await QR.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-encryptedData')
      .lean();
    
    // Get total count for pagination
    const total = await QR.countDocuments(filter);
    
    return {
      qrCodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get QR codes service error:', error);
    throw error;
  }
};

// Generate QR code image
const generateQRImage = async (value, size = 200, margin = 4, errorCorrectionLevel = 'M') => {
  try {
    return await qrGenerator.generateQRImage(value, size, margin, errorCorrectionLevel);
  } catch (error) {
    logger.error('Generate QR image service error:', error);
    throw error;
  }
};

// Cleanup expired QR codes
const cleanupExpiredQRCodes = async () => {
  try {
    return await QR.cleanupExpired();
  } catch (error) {
    logger.error('Cleanup expired QR codes service error:', error);
    throw error;
  }
};

export default {
  generateQRCode,
  getQRCodeById,
  getQRCodeByValue,
  deactivateQRCode,
  getQRCodes,
  generateQRImage,
  cleanupExpiredQRCodes
};