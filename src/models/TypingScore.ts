import mongoose, { Schema, Document } from "mongoose";

export interface ITypingScore extends Document {
  userId: string;
  name: string;
  wpm: number;
  accuracy: number;
  createdAt: Date;
}

const TypingScoreSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
const TypingScore = mongoose.models.TypingScore || mongoose.model<ITypingScore>("TypingScore", TypingScoreSchema);

export const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);
};

export default TypingScore;
