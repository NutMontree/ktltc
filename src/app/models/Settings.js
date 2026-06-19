import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    type: { type: String, default: "pdca_config", unique: true },
    pdcaItems: [
      {
        id: Number,
        label: String,
      }
    ],
    departments: [String],
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

export default Settings;
