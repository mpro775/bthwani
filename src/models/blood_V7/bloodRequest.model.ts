import mongoose from "mongoose";

const BloodRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  notes: { type: String },
  urgent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["active", "fulfilled", "expired"],
    default: "active"
  },
  matchedDonors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// فهرسة جغرافية للموقع
BloodRequestSchema.index({ location: "2dsphere" });

export const BloodRequest = mongoose.model("BloodRequest", BloodRequestSchema);
