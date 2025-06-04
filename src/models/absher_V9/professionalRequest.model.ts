import mongoose, { Schema, Document } from "mongoose";

export interface IProfessionalRequest extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  subcategory?: string;
  location: string;
  details: string;
  status: "pending" | "assigned" | "completed" | "cancelled";
  assignedProvider?: mongoose.Types.ObjectId;
  response?: string;
  rating?: number;
  fee?: number;
  createdAt: Date;
}

const ProfessionalRequestSchema = new Schema<IProfessionalRequest>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  location: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, enum: ["pending", "assigned", "completed", "cancelled"], default: "pending" },
  assignedProvider: { type: Schema.Types.ObjectId, ref: "User" },
  response: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  fee: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export const ProfessionalRequest = mongoose.model<IProfessionalRequest>("ProfessionalRequest", ProfessionalRequestSchema);
