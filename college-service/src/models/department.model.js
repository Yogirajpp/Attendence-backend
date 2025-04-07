import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  description: {
    type: String
  },
  headOfDepartment: {
    name: String,
    email: String,
    phone: String,
    userId: {
      type: String
    }
  },
  establishedYear: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

// Compound index to ensure unique code per college
departmentSchema.index({ collegeId: 1, code: 1 }, { unique: true });
departmentSchema.index({ collegeId: 1, name: 1 });
departmentSchema.index({ isActive: 1 });

const Department = mongoose.model('Department', departmentSchema);

export default Department;