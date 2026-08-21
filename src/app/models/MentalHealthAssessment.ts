import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMentalHealthAssessment extends Document {
  type: string;
  age: number;
  gender: string;
  status: string;
  st5Score: number;
  q9Score: number;
  createdAt: Date;
}

const MentalHealthAssessmentSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  st5Score: {
    type: Number,
    required: true,
  },
  q9Score: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const MentalHealthAssessment: Model<IMentalHealthAssessment> =
  mongoose.models.MentalHealthAssessment ||
  mongoose.model<IMentalHealthAssessment>("MentalHealthAssessment", MentalHealthAssessmentSchema);
