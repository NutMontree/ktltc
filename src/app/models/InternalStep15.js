import mongoose from "mongoose";

const InternalStep15Schema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  content: String,
  fileUrl: [{ type: String }],
  originalFileName: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.InternalStep15 || mongoose.model("InternalStep15", InternalStep15Schema);
