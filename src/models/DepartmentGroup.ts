import mongoose, { Schema, Document } from "mongoose";

export interface IDepartmentOption {
  value: string;
  label: string;
}

export interface IDepartmentGroup extends Document {
  label: string;
  options: IDepartmentOption[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentOptionSchema = new Schema<IDepartmentOption>({
  value: { type: String, required: true },
  label: { type: String, required: true },
});

const DepartmentGroupSchema = new Schema<IDepartmentGroup>(
  {
    label: { type: String, required: true },
    options: [DepartmentOptionSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DepartmentGroup =
  mongoose.models.DepartmentGroup ||
  mongoose.model<IDepartmentGroup>("DepartmentGroup", DepartmentGroupSchema);
