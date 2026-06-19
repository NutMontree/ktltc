import mongoose from "mongoose";

const ProjectApprovalSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  // Memo Style Fields
  docNumber: String,
  date: String,
  subject: String,
  salutation: String,
  paragraphs: [String],
  introPrefix: String,
  departmentName: String,
  additionalIntroText: String,
  projectName: String,
  signerName: String,
  signerPosition: String,
  deputy2Name: String,
  deputy2Position: String,
  deputy2Comment: String,
  directorName: String,
  directorComment: String,
  footerText: String,
  // Old fields (keep for compatibility or if needed later)
  title: String,
  rationale: String,
  objectives: [String],
  targets: {
    quantity: String,
    quality: String
  },
  steps: [
    {
      activity: String,
      period: String
    }
  ],
  budget: [
    {
      item: String,
      amount: Number
    }
  ],
  expectedOutcomes: [String],
  responsiblePerson: String,
}, { timestamps: true });

export default mongoose.models.ProjectApproval || mongoose.model("ProjectApproval", ProjectApprovalSchema);
