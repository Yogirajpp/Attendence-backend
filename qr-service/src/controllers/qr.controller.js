import qrService from '../services/qr.service.js';
import logger from '../utils/logger.js';

// Generate a new QR code
const generateQRCode = async (req, res, next) => {
  try {
    const { 
      type, 
      payload, 
      expiryTime, 
      maxUsage, 
      entityId 
    } = req.body;
    
    // Generate QR code
    const qrCode = await qrService.generateQRCode({
      type: type || 'verification',
      payload,
      expiryTime,
      maxUsage: maxUsage || 1,
      createdFor: entityId,
      createdBy: req.user.id
    });
    
    return res.status(201).json({
      message: 'QR code generated successfully',
      qrCode: {
        id: qrCode._id,
        value: qrCode.value,
        expiresAt: qrCode.expiresAt,
        type: qrCode.type,
        createdAt: qrCode.createdAt
      }
    });
  } catch (error) {
    logger.error('Generate QR code error:', error);
    next(error);
  }
};

// Generate an attendance QR code
const generateAttendanceQR = async (req, res, next) => {
  try {
    const { 
      sessionId, 
      classId, 
      entityId, 
      expiryTime 
    } = req.body;
    
    if (!sessionId || !classId) {
      return res.status(400).json({ 
        message: 'Session ID and Class ID are required' 
      });
    }
    
    // Create attendance QR payload
    const payload = {
      sessionId,
      classId,
      timestamp: new Date()
    };
    
    // Default expiry is 4 seconds for attendance QR codes
    const expiry = expiryTime || 4000; // 4 seconds in milliseconds
    
    // Generate QR code
    const qrCode = await qrService.generateQRCode({
      type: 'attendance',
      payload,
      expiryTime: expiry,
      maxUsage: 0, // Unlimited usage within timeframe
      createdFor: entityId || sessionId,
      createdBy: req.user.id
    });
    
    return res.status(201).json({
      message: 'Attendance QR code generated successfully',
      qrCode: {
        id: qrCode._id,
        value: qrCode.value,
        expiresAt: qrCode.expiresAt,
        type: qrCode.type,
        createdAt: qrCode.createdAt
      }
    });
  } catch (error) {
    logger.error('Generate attendance QR error:', error);
    next(error);
  }
};

// Generate an access QR code
const generateAccessQR = async (req, res, next) => {
  try {
    const { 
      userId, 
      locationId, 
      permissions, 
      expiryTime,
      maxUsage 
    } = req.body;
    
    if (!userId || !locationId) {
      return res.status(400).json({ 
        message: 'User ID and Location ID are required' 
      });
    }
    
    // Create access QR payload
    const payload = {
      userId,
      locationId,
      permissions: permissions || ['entry'],
      timestamp: new Date()
    };
    
    // Default expiry is 24 hours for access QR codes
    const expiry = expiryTime || 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Generate QR code
    const qrCode = await qrService.generateQRCode({
      type: 'access',
      payload,
      expiryTime: expiry,
      maxUsage: maxUsage || 1,
      createdFor: userId,
      createdBy: req.user.id
    });
    
    return res.status(201).json({
      message: 'Access QR code generated successfully',
      qrCode: {
        id: qrCode._id,
        value: qrCode.value,
        expiresAt: qrCode.expiresAt,
        type: qrCode.type,
        createdAt: qrCode.createdAt
      }
    });
  } catch (error) {
    logger.error('Generate access QR error:', error);
    next(error);
  }
};

// Generate an information QR code
const generateInfoQR = async (req, res, next) => {
  try {
    const { 
      title, 
      content, 
      url, 
      expiryTime,
      maxUsage,
      entityId 
    } = req.body;
    
    // Create information QR payload
    const payload = {
      title,
      content,
      url,
      timestamp: new Date()
    };
    
    // Default expiry is 90 days for information QR codes
    const expiry = expiryTime || 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    
    // Generate QR code
    const qrCode = await qrService.generateQRCode({
      type: 'information',
      payload,
      expiryTime: expiry,
      maxUsage: maxUsage || 0, // Unlimited usage for info QR codes
      createdFor: entityId || 'public',
      createdBy: req.user.id
    });
    
    return res.status(201).json({
      message: 'Information QR code generated successfully',
      qrCode: {
        id: qrCode._id,
        value: qrCode.value,
        expiresAt: qrCode.expiresAt,
        type: qrCode.type,
        createdAt: qrCode.createdAt
      }
    });
  } catch (error) {
    logger.error('Generate information QR error:', error);
    next(error);
  }
};

// Get QR code details
const getQRCodeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const qrCode = await qrService.getQRCodeById(id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    // Return only necessary details
    return res.status(200).json({
      qrCode: {
        id: qrCode._id,
        value: qrCode.value,
        type: qrCode.type,
        expiresAt: qrCode.expiresAt,
        isActive: qrCode.isActive,
        usageCount: qrCode.usageCount,
        maxUsage: qrCode.maxUsage,
        createdAt: qrCode.createdAt,
        lastUsedAt: qrCode.lastUsedAt
      }
    });
  } catch (error) {
    logger.error('Get QR code details error:', error);
    next(error);
  }
};

// Deactivate a QR code
const deactivateQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const qrCode = await qrService.deactivateQRCode(id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    return res.status(200).json({
      message: 'QR code deactivated successfully',
      qrCode: {
        id: qrCode._id,
        value: qrCode.value,
        isActive: qrCode.isActive
      }
    });
  } catch (error) {
    logger.error('Deactivate QR code error:', error);
    next(error);
  }
};

// Get QR codes by criteria
const getQRCodes = async (req, res, next) => {
  try {
    const { 
      type, 
      createdFor,
      isActive,
      page = 1,
      limit = 10 
    } = req.query;
    
    // Create filter object
    const filter = {};
    if (type) filter.type = type;
    if (createdFor) filter.createdFor = createdFor;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const qrCodes = await qrService.getQRCodes(
      parseInt(page, 10),
      parseInt(limit, 10),
      filter
    );
    
    return res.status(200).json(qrCodes);
  } catch (error) {
    logger.error('Get QR codes error:', error);
    next(error);
  }
};

// Get QR image
const getQRImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { size = 200, margin = 4, errorCorrection = 'M' } = req.query;
    
    const qrCode = await qrService.getQRCodeById(id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    if (!qrCode.isActive) {
      return res.status(400).json({ message: 'QR code is inactive' });
    }
    
    if (qrCode.expiresAt < new Date()) {
      return res.status(400).json({ message: 'QR code has expired' });
    }
    
    // Generate QR code image
    const qrImage = await qrService.generateQRImage(
      qrCode.value,
      parseInt(size, 10),
      parseInt(margin, 10),
      errorCorrection
    );
    
    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Send the QR code image
    return res.status(200).send(qrImage);
  } catch (error) {
    logger.error('Get QR image error:', error);
    next(error);
  }
};

// Cleanup expired QR codes
const cleanupExpiredQRCodes = async (req, res, next) => {
  try {
    // Verify the user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Insufficient permissions to perform this action' 
      });
    }
    
    const deletedCount = await qrService.cleanupExpiredQRCodes();
    
    return res.status(200).json({
      message: 'Expired QR codes cleaned up successfully',
      deletedCount
    });
  } catch (error) {
    logger.error('Cleanup expired QR codes error:', error);
    next(error);
  }
};

export default {
  generateQRCode,
  generateAttendanceQR,
  generateAccessQR,
  generateInfoQR,
  getQRCodeDetails,
  deactivateQRCode,
  getQRCodes,
  getQRImage,
  cleanupExpiredQRCodes
};