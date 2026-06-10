import mongoose from 'mongoose';

const competencyMetricSchema = new mongoose.Schema(
  {
    competencyCode: { type: String, required: true, trim: true },
    competencyName: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginning', 'Developing', 'Proficient', 'Mastery'],
      required: true,
    },
    score: { type: Number, min: 0, max: 100, required: true },
    lastAssessedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
      default: 'student',
    },
    admissionNumber: { type: String, trim: true },
    gradeLevel: {
      type: Number,
      enum: [10, 11, 12],
      required() {
        return this.role === 'student';
      },
    },
    pathway: {
      type: String,
      enum: ['STEM', 'Social Sciences', 'Arts & Sports'],
      required() {
        return this.role === 'student';
      },
    },
    competencyMetrics: [competencyMetricSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model('User', userSchema);

