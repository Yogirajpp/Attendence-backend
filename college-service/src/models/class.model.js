import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
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
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacherId: {
    type: String,
    required: true
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    dayOfWeek: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
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
    room: {
      type: String,
      required: true
    }
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
  batch: {
    type: String,
    required: true
  },
  section: {
    type: String
  },
  maxStudents: {
    type: Number
  },
  enrolledStudents: [{
    type: String // User IDs from Auth service
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

// Compound index for unique classes
classSchema.index({ collegeId: 1, departmentId: 1, courseId: 1, code: 1 }, { unique: true });
classSchema.index({ collegeId: 1 });
classSchema.index({ departmentId: 1 });
classSchema.index({ courseId: 1 });
classSchema.index({ subjectId: 1 });
classSchema.index({ teacherId: 1 });
classSchema.index({ semester: 1, year: 1 });
classSchema.index({ batch: 1 });
classSchema.index({ isActive: 1 });

const Class = mongoose.model('Class', classSchema);

export default Class;