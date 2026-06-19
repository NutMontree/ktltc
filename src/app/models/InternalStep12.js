import mongoose from "mongoose";

const InternalStep12Schema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  content: String,
  fileUrl: [{ type: String }],
  originalFileName: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.InternalStep12 || mongoose.model("InternalStep12", InternalStep12Schema);
