import mongoose from "mongoose";

const InternalStep18Schema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  content: String,
  fileUrl: [{ type: String }],
  originalFileName: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.InternalStep18 || mongoose.model("InternalStep18", InternalStep18Schema);
