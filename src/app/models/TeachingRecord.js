import mongoose from "mongoose";

const teachingRecordSchema = new mongoose.Schema(
  {
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    teachingNo: { type: String, required: true },
    date: { type: String, default: "" },
    weekNo: { type: String, default: "" },
    unitNo: { type: String, default: "" },
    unitName: { type: String, default: "" },
    topic: { type: String, default: "" },
    activities: { type: String, default: "" },
    isTheory: { type: Boolean, default: false },
    isPractice: { type: Boolean, default: false },
    results: { type: String, default: "" },
    problems: { type: String, default: "" },
    signerName: { type: String, default: "" },
    headName: { type: String, default: "" },
    activitiesImages: { type: [String], default: [] },
    resultsImages: { type: [String], default: [] },
    problemsImages: { type: [String], default: [] },
    teacherSignature: { type: String, default: "" },
    headSignature: { type: String, default: "" },
  },
  { timestamps: true }
);

const TeachingRecord =
  mongoose.models.TeachingRecord ||
  mongoose.model("TeachingRecord", teachingRecordSchema);

export default TeachingRecord;
