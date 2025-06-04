import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.model("Booking", BookingSchema);
