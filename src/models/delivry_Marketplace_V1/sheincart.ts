import mongoose from "mongoose";

const SheinItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  image: String,
  sheinUrl: String,
  quantity: { type: Number, default: 1 },
});

const SheinCartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [SheinItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

export const SheinCart = mongoose.model("SheinCart", SheinCartSchema);
