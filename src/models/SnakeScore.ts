import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISnakeScore extends Document {
  userId: string;
  name: string;
  userImage?: string;
  score: number;
  createdAt: Date;
}

const SnakeScoreSchema = new Schema<ISnakeScore>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  userImage: { type: String, default: "" },
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Use existing model or create new one
export const SnakeScore: Model<ISnakeScore> =
  mongoose.models.SnakeScore || mongoose.model<ISnakeScore>("SnakeScore", SnakeScoreSchema);
