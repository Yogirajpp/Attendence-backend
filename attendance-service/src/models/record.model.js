import mongoose from 'mongoose';

const studentRecordSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  attended: {
    type: Number,
    default: 0
  },
  absent: {
    type: Number,
    default: 0
  },
  late: {
    type: Number,
    default: 0
  },
  excused: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0
  }
});

const recordSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  classId: {
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
  teacherId: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  studentRecords: [studentRecordSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
recordSchema.index({ courseId: 1 });
recordSchema.index({ subjectId: 1 });
recordSchema.index({ classId: 1 });
recordSchema.index({ collegeId: 1 });
recordSchema.index({ departmentId: 1 });
recordSchema.index({ teacherId: 1 });
recordSchema.index({ semester: 1, year: 1 });
recordSchema.index({ batch: 1 });

// Method to calculate statistics
recordSchema.methods.calculateStatistics = function() {
  // Calculate average attendance percentage across all students
  if (this.studentRecords.length === 0) {
    return {
      averageAttendance: 0,
      lowestAttendance: 0,
      highestAttendance: 0
    };
  }
  
  const attendancePercentages = this.studentRecords.map(record => record.attendancePercentage);
  
  return {
    averageAttendance: attendancePercentages.reduce((acc, val) => acc + val, 0) / attendancePercentages.length,
    lowestAttendance: Math.min(...attendancePercentages),
    highestAttendance: Math.max(...attendancePercentages)
  };
};

const Record = mongoose.model('Record', recordSchema);

export default Record;