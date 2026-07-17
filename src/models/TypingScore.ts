import mongoose, { Schema, Document } from "mongoose";

export interface ITypingScore extends Document {
  userId: string;
  name: string;
  userImage?: string;
  language: string;
  wpm: number;
  accuracy: number;
  createdAt: Date;
}

const TypingScoreSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  userImage: { type: String, default: "" },
  language: { type: String, default: "th" },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
const TypingScore = mongoose.models.TypingScore || mongoose.model<ITypingScore>("TypingScore", TypingScoreSchema);

import { connectMongoose } from "@/lib/mongoose";

export const connectDB = async () => {
  return connectMongoose();
};

export default TypingScore;
