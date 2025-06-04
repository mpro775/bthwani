import mongoose from "mongoose";

const BloodMessageSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

export const BloodMessage = mongoose.model("BloodMessage", BloodMessageSchema);
