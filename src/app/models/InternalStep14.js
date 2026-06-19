import mongoose from "mongoose";

const InternalStep14Schema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  content: String,
  fileUrl: [{ type: String }],
  originalFileName: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.InternalStep14 || mongoose.model("InternalStep14", InternalStep14Schema);
