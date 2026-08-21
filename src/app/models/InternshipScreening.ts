import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInternshipScreening extends Document {
  name: string;
  studentId: string;
  department: string;
  classroom: string;
  age: string;
  gender: string;
  
  // Mental Health Scores
  st5Total: number;
  twoQTotal: number;
  q9Total: number;
  q8Total: number;
  
  // Soft Skills Score
  softSkillsScore: number;
  softSkillsTotal: number;
  
  // Computed Status
  mentalHealthRisk: boolean;
  softSkillsPercentage: number;
  
  createdAt: Date;
}

const InternshipScreeningSchema: Schema = new Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true },
  department: { type: String, required: true },
  classroom: { type: String, default: "" },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  
  st5Total: { type: Number, required: true },
  twoQTotal: { type: Number, required: true },
  q9Total: { type: Number, required: true },
  q8Total: { type: Number, required: true },
  
  softSkillsScore: { type: Number, required: true },
  softSkillsTotal: { type: Number, required: true },
  
  mentalHealthRisk: { type: Boolean, required: true },
  softSkillsPercentage: { type: Number, required: true },
  
  createdAt: { type: Date, default: Date.now },
});

export const InternshipScreening: Model<IInternshipScreening> =
  mongoose.models.InternshipScreening ||
  mongoose.model<IInternshipScreening>("InternshipScreening", InternshipScreeningSchema);
