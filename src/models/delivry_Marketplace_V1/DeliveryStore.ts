import mongoose, { Schema, Document } from "mongoose";

interface IWorkSchedule {
  day: string;
  open: boolean;
  from?: string; // أصبح اختياري
  to?: string; // أصبح اختياري
}

export interface IDeliveryStore extends Document {
  name: string;
  address: string;
  category: mongoose.Types.ObjectId;
  location: { lat: number; lng: number };
  isActive: boolean;
  image?: string;
  logo?: string;
  forceClosed: boolean;
  forceOpen: boolean;
  schedule: IWorkSchedule[];
  commissionRate: number;
  takeCommission: boolean;
  isTrending:boolean;
  isFeatured:boolean;
  pricingStrategy?: mongoose.Types.ObjectId | null;
  pricingStrategyType:string;
}

// src/models/delivry_Marketplace_V1/DeliveryStore.ts

const storeSchema = new Schema<IDeliveryStore>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryCategory",
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    commissionRate: {
      type: Number,
      default: 0,
    },
    takeCommission: {
      type: Boolean,
      default: true,
    },
    isTrending: { type: Boolean, default: false },    // متجر رائج
    isFeatured: { type: Boolean, default: false },    // متجر مميز
    pricingStrategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PricingStrategy",
      default: null,
    },
    pricingStrategyType: {
      type: String,
      enum: ["auto", "manual", ""],
      default: "",
    },
    isActive: { type: Boolean, default: true },
    image: { type: String },
    logo: { type: String },
    forceClosed: { type: Boolean, default: false },
    forceOpen: { type: Boolean, default: false },
    schedule: [
      {
        day: { type: String, required: true },
        open: { type: Boolean, default: false },
        from: String,
        to: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IDeliveryStore>("DeliveryStore", storeSchema);
