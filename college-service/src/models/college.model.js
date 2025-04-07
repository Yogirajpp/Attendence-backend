import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  }
});

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  }
});

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  contacts: [contactSchema],
  website: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String
  },
  description: {
    type: String
  },
  establishedYear: {
    type: Number
  },
  accreditation: [{
    name: String,
    year: Number,
    grade: String,
    validUntil: Date
  }],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
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

// Indexes for faster queries
collegeSchema.index({ code: 1 }, { unique: true });
collegeSchema.index({ name: 1 });
collegeSchema.index({ companyId: 1 });
collegeSchema.index({ isActive: 1 });

const College = mongoose.model('College', collegeSchema);

export default College;