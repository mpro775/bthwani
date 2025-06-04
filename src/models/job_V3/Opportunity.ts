import mongoose from "mongoose";

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  type: String, // توظيف أو خدمة
  governorate: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Opportunity = mongoose.model("Opportunity", OpportunitySchema);
