import mongoose from "mongoose";

const InternalStep14Schema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  content: String,
  header1: String,
  header2: String,
  footerText: String,
  participants: [{
    name: String,
    position: String,
    remark: String
  }],
  fileUrl: [{ type: String }],
  originalFileName: [{ type: String }]
}, { timestamps: true });

// Force recompile in Next.js dev mode
if (mongoose.models.InternalStep14) {
  delete mongoose.models.InternalStep14;
}

export default mongoose.model("InternalStep14", InternalStep14Schema);
