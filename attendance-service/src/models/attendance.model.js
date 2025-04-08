import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: String, // UserID of the person who marked attendance (teacher or student)
    required: true
  },
  biometricVerified: {
    type: Boolean,
    default: false
  },
  qrVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['qr', 'biometric', 'manual', 'system'],
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  device: {
    type: String
  },
  ipAddress: {
    type: String
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure unique student attendance per session
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ markedAt: 1 });
attendanceSchema.index({ status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;