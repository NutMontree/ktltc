import mongoose from "mongoose";

const ProjectDetailSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  projectName: String,
  departmentName: String,
  divisionName: String,
  projectType: String,
  strategicAlignment: [String],
  rationale: String,
  objectives: [String],
  targets: {
    quantity: [String],
    quality: [String]
  },
  overallPeriod: String,
  overallLocation: [String],
  steps: [
    {
      activity: String,
      months: [Number]
    }
  ],
  budgetSources: {
    operating: {
      vocational: Number,
      highVocational: Number,
      shortCourse: Number
    },
    subsidy: { detail: String, amount: Number },
    other: { detail: String, amount: Number },
    educationSupport: Number
  },
  budget: [
    {
      item: String,
      amount: Number
    }
  ],
  expectedOutcomes: [String],
  evaluationMethods: [String],
  proposer: { name: String, position: String },
  endorser: { name: String, position: String },
  approver: { name: String, position: String },
}, { timestamps: true });

if (mongoose.models.ProjectDetail) {
  delete mongoose.models.ProjectDetail;
}

export default mongoose.model("ProjectDetail", ProjectDetailSchema);
