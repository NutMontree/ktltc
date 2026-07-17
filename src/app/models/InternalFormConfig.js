import mongoose, { Schema } from "mongoose";

import { connectMongoose } from "@/lib/mongoose";

connectMongoose();

const InternalFormConfigSchema = new Schema(
  {
    type: { type: String, default: "internal_pdca_form", unique: true },
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

const InternalFormConfig = mongoose.models.InternalFormConfig || mongoose.model("InternalFormConfig", InternalFormConfigSchema);

export default InternalFormConfig;
