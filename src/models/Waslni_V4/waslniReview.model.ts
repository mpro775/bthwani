// models/waslni/waslniReview.model.ts
import { Schema, model, Types, Document } from "mongoose";

export interface IWaslniReview extends Document {
  driverId: Types.ObjectId;
  userId: Types.ObjectId;
  bookingId: Types.ObjectId;
  rating: number;
  comment?: string;
}

const WaslniReviewSchema = new Schema<IWaslniReview>(
  {
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "WaslniBooking", required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

export const WaslniReview = model<IWaslniReview>("WaslniReview", WaslniReviewSchema);
