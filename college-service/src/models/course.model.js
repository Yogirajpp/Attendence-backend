import mongoose from 'mongoose';

const syllabusItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  units: [{
    title: String,
    topics: [String]
  }]
});

const courseSchema = new mongoose.Schema({
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
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: {
    type: String
  },
  duration: {
    years: {
      type: Number,
      required: true
    },
    semesters: {
      type: Number,
      required: true
    }
  },
  type: {
    type: String,
    enum: ['undergraduate', 'postgraduate', 'diploma', 'certificate', 'phd'],
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  syllabus: [syllabusItemSchema],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
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
courseSchema.index({ collegeId: 1, code: 1 }, { unique: true });
courseSchema.index({ departmentId: 1 });
courseSchema.index({ type: 1 });
courseSchema.index({ isActive: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;