import mongoose from 'mongoose';

const qrSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  payload: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    enum: ['attendance', 'access', 'information', 'verification'],
    required: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  createdFor: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: 1
  },
  lastUsedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
qrSchema.index({ value: 1 }, { unique: true });
qrSchema.index({ expiresAt: 1 });
qrSchema.index({ createdFor: 1 });
qrSchema.index({ type: 1 });
qrSchema.index({ isActive: 1 });

// Cleanup expired QR codes - scheduled task could use this method
qrSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  return result.deletedCount;
};

// Method to check if a QR code is valid
qrSchema.methods.isValid = function() {
  // Check if it's active
  if (!this.isActive) {
    return false;
  }
  
  // Check if it's expired
  if (this.expiresAt < new Date()) {
    return false;
  }
  
  // Check if it has reached max usage
  if (this.usageCount >= this.maxUsage) {
    return false;
  }
  
  return true;
};

// Method to mark QR code as used
qrSchema.methods.markAsUsed = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  
  // If reached max usage, deactivate it
  if (this.usageCount >= this.maxUsage) {
    this.isActive = false;
  }
  
  await this.save();
  
  return this;
};

const QR = mongoose.model('QR', qrSchema);

export default QR;