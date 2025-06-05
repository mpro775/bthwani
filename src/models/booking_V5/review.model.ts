// models/review.model.ts
import mongoose from "mongoose";
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: "BookingService" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  comment: String,
  flagged: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Reviewv5", ReviewSchema);
