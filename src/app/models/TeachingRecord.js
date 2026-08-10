import mongoose from "mongoose";

const teachingRecordSchema = new mongoose.Schema(
  {
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    teachingNo: { type: String, required: true },
    date: { type: String, required: true },
    weekNo: { type: String, required: true },
    unitNo: { type: String, required: true },
    unitName: { type: String, required: true },
    topic: { type: String, required: true },
    activities: { type: String, required: true },
    isTheory: { type: Boolean, default: false },
    isPractice: { type: Boolean, default: false },
    results: { type: String, required: true },
    problems: { type: String, required: true },
    activitiesImages: { type: [String], default: [] },
    resultsImages: { type: [String], default: [] },
    problemsImages: { type: [String], default: [] },
    signerName: { type: String, required: true },
    headName: { type: String, required: true },
    teacherSignature: { type: String, default: "" },
    headSignature: { type: String, default: "" },
  },
  { timestamps: true }
);

const TeachingRecord =
  mongoose.models.TeachingRecord ||
  mongoose.model("TeachingRecord", teachingRecordSchema);

export default TeachingRecord;
