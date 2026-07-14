import mongoose, { Schema } from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable");
}

// Global cached connection for Serverless Environment (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { maxPoolSize: 50 }).then((mongoose) => {
      console.log("MongoDB connected (FormConfig)");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
connectMongo();

const FormConfigSchema = new Schema(
  {
    type: { type: String, default: "pdca_form", unique: true },
    pdcaItems: [
      {
        id: Number,
        label: String,
      }
    ],
    departments: [String],
    fiscalYears: { type: [String], default: ["2567", "2568", "2569", "2570"] },
  },
  {
    timestamps: true,
  }
);

const FormConfig = mongoose.models.FormConfig || mongoose.model("FormConfig", FormConfigSchema);

export default FormConfig;
