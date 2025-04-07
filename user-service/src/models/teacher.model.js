import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
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
  employeeId: {
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
  position: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    specialization: String
  }],
  experience: [{
    organization: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
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
teacherSchema.index({ userId: 1 });
teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ collegeId: 1 });
teacherSchema.index({ departmentId: 1 });
teacherSchema.index({ 'subjects': 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;