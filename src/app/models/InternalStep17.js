import mongoose from "mongoose";

const InternalStep17Schema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  content: String,
  fileUrl: [{ type: String }],
  originalFileName: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.InternalStep17 || mongoose.model("InternalStep17", InternalStep17Schema);
