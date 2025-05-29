import mongoose from "mongoose";

const barterSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  offeredProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  requesterId: String,
  message: String,
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});
export const BarterRequest = mongoose.model("BarterRequest", barterSchema);
