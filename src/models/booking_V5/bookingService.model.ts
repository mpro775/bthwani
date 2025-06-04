// models/bookingService.model.ts
import mongoose from "mongoose";
const { Schema } = mongoose;

const AvailabilitySchema = new Schema({
  day: { type: String, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
  slots: [{ start: String, end: String }]
});

const BookingServiceSchema = new Schema({
  title: String,
  description: String,
  type: { type: String, enum: ["clinic", "salon", "hall", "course"] },
  categories: [String],
  media: [String],
  price: Number,
  initialDeposit: Number,
  availability: [AvailabilitySchema],
  location: {
    city: String,
    region: String,
    coordinates: { lat: Number, lng: Number }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

export default mongoose.model("BookingService", BookingServiceSchema);
