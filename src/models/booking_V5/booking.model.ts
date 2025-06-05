// models/booking.model.ts
import mongoose, { Types } from "mongoose";
import { UserDocument } from "../user";
const { Schema } = mongoose;

export interface BookingDocument extends Document {
  userId: Types.ObjectId | UserDocument;
  providerId: Types.ObjectId | UserDocument;
  amount: number;
  status: string;
  cancelReason:string;
  date?: Date;
  serviceId?: Types.ObjectId;
}

const BookingSchema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: "BookingService" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  date: Date,
  cancelReason: { type: String, default: "" },

  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled", "no-show"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Bookingv5", BookingSchema);
