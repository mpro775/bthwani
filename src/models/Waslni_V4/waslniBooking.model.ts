// models/waslni/waslniBooking.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IWaslniBooking extends Document {
  userId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  category: "waslni" | "heavy";
  fromLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  toLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  dateTime: Date;
  status: "pending" | "accepted" | "started" | "completed" | "cancelled";
  isFemaleDriver?: boolean;
  proofImage?: string;
  otp?: string;
  city: string;
  priceEstimate?: number;
}

const WaslniBookingSchema: Schema = new Schema<IWaslniBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    category: { type: String, enum: ["women_driver"], required: true },
    fromLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    toLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    dateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "started", "completed", "cancelled"],
      default: "pending",
    },
    isFemaleDriver: { type: Boolean, default: false },
    proofImage: { type: String },
    otp: { type: String },
    city: { type: String, required: true },
    priceEstimate: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const WaslniBooking = mongoose.model<IWaslniBooking>(
  "WaslniBooking",
  WaslniBookingSchema
);
