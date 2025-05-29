import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  reporterId: String, // Firebase UID
  reason: String,
  createdAt: { type: Date, default: Date.now }
});
export const ProductReport = mongoose.model("ProductReport", reportSchema);
