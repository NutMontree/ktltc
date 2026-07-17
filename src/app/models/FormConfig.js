import mongoose, { Schema } from "mongoose";

import { connectMongoose } from "@/lib/mongoose";

connectMongoose();

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
