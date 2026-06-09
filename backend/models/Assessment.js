import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    gradeLevel: { type: Number, enum: [10, 11, 12], required: true },
    pathway: {
      type: String,
      enum: ['STEM', 'Social Sciences', 'Arts & Sports'],
      required: true,
    },
    competencyCode: { type: String, required: true, trim: true },
    maxScore: { type: Number, required: true, min: 1 },
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export default mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
