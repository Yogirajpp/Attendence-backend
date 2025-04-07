import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  // Reference to the User model
  userProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1
  },
  year: {
    type: Number,
    required: true
  },
  section: {
    type: String
  },
  enrollmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  guardianName: {
    type: String
  },
  guardianContact: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for faster queries
studentSchema.index({ userId: 1 });
studentSchema.index({ enrollmentNumber: 1 });
studentSchema.index({ collegeId: 1 });
studentSchema.index({ departmentId: 1 });
studentSchema.index({ courseId: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ year: 1, semester: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;