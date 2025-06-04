// models/charity/donation.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDonation extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  content: string;
  quantity: string;
  area: string;
  status: "pending" | "assigned";
  organization?: string;
  createdAt: Date;
}

const DonationSchema = new Schema<IDonation>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  quantity: { type: String, required: true },
  area: { type: String, required: true },
  status: { type: String, enum: ["pending", "assigned"], default: "pending" },
  organization: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Donation = mongoose.model<IDonation>("Donation", DonationSchema);
