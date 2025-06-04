import mongoose from "mongoose";

const DeliveryOrderSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  status: { type: String, enum: ["pending", "in_progress", "delivered", "cancelled"], default: "pending" },
  pickupLocation: { lat: Number, lng: Number },
  dropoffLocation: { lat: Number, lng: Number },
  details: String,
  assignedAt: Date,
  deliveredAt: Date,
  cost: Number,
}, { timestamps: true });

export const DeliveryOrder = mongoose.model("DeliveryOrder", DeliveryOrderSchema);
