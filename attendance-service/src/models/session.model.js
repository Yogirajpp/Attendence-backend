import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  classId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  teacherId: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  collegeId: {
    type: String,
    required: true
  },
  departmentId: {
    type: String,
    required: true
  },
  room: {
    type: String
  },
  topic: {
    type: String
  },
  description: {
    type: String
  },
  attendanceWindow: {
    openTime: {
      type: Date,
      required: true
    },
    closeTime: {
      type: Date,
      required: true
    }
  },
  qrCode: {
    value: String,
    expiryTime: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  expectedStudents: [{
    type: String // Student IDs expected to attend
  }],
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
sessionSchema.index({ classId: 1 });
sessionSchema.index({ date: 1 });
sessionSchema.index({ teacherId: 1 });
sessionSchema.index({ courseId: 1 });
sessionSchema.index({ subjectId: 1 });
sessionSchema.index({ collegeId: 1 });
sessionSchema.index({ departmentId: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ 'attendanceWindow.openTime': 1 });
sessionSchema.index({ 'attendanceWindow.closeTime': 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;