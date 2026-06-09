import mongoose from 'mongoose';

const curriculumPathwaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['STEM', 'Social Sciences', 'Arts & Sports'],
      required: true,
      unique: true,
    },
    description: { type: String, required: true, trim: true },
    coreSubjects: [{ type: String, required: true, trim: true }],
    electiveSubjects: [{ type: String, trim: true }],
    gradeBands: {
      type: [Number],
      default: [10, 11, 12],
      validate: (grades) => grades.every((g) => [10, 11, 12].includes(g)),
    },
  },
  { timestamps: true },
);

export default mongoose.models.CurriculumPathway ||
  mongoose.model('CurriculumPathway', curriculumPathwaySchema);
