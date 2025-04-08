import crypto from 'crypto';
import config from '../config/index.js';
import logger from './logger.js';

// Get encryption key and IV from config or generate them
const getEncryptionKey = () => {
  if (config.encryption.key) {
    return Buffer.from(config.encryption.key, 'hex');
  }
  
  // Generate a key if not provided (should only be used in development)
  logger.warn('Encryption key not provided, generating a temporary one');
  return crypto.randomBytes(32);
};

const getIV = () => {
  if (config.encryption.iv) {
    return Buffer.from(config.encryption.iv, 'hex');
  }
  
  // Generate an IV if not provided (should only be used in development)
  logger.warn('Encryption IV not provided, generating a temporary one');
  return crypto.randomBytes(16);
};

// Encrypt data
const encrypt = (text) => {
  try {
    const key = getEncryptionKey();
    const iv = getIV();
    
    const cipher = crypto.createCipheriv(config.encryption.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prefix with IV for decryption later
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data
const decrypt = (text) => {
  try {
    const key = getEncryptionKey();
    
    // Extract IV from the text
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    
    const decipher = crypto.createDecipheriv(config.encryption.algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Hash data using SHA-256
const hash = (text) => {
  try {
    return crypto.createHash('sha256').update(text).digest('hex');
  } catch (error) {
    logger.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};

// Generate HMAC for data verification
const generateHMAC = (text) => {
  try {
    const key = getEncryptionKey();
    return crypto.createHmac('sha256', key).update(text).digest('hex');
  } catch (error) {
    logger.error('HMAC generation error:', error);
    throw new Error('Failed to generate HMAC');
  }
};

// Verify HMAC
const verifyHMAC = (text, hmac) => {
  try {
    const calculatedHMAC = generateHMAC(text);
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHMAC, 'hex'),
      Buffer.from(hmac, 'hex')
    );
  } catch (error) {
    logger.error('HMAC verification error:', error);
    return false;
  }
};

export default {
  encrypt,
  decrypt,
  hash,
  generateHMAC,
  verifyHMAC
};