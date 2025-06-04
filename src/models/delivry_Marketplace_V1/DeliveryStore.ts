import mongoose, { Schema, Document } from "mongoose";

interface IWorkSchedule {
  day: string;       // "monday"
  open: boolean;
  from: string;      // "09:00"
  to: string;        // "17:00"
}

export interface IDeliveryStore extends Document {
  name: string;
  address: string;
  category: mongoose.Types.ObjectId;
  location: { lat: number; lng: number };
  isActive: boolean;
  image?: string;
  logo?: string;
  forceClosed?:boolean;
  forceOpen?:boolean;
  schedule: IWorkSchedule[];
}

const storeSchema = new Schema<IDeliveryStore>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "DeliveryCategory", required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true },
    image: { type: String },
    logo: { type: String },
    schedule: [
      {
        day: { type: String, required: true },
        open: { type: Boolean, default: false },
        from: { type: String }, // توقيت 24 ساعة
        to: { type: String },
      },
    ],
      forceClosed: { type: Boolean, default: false },     // إغلاق إجباري
  forceOpen:   { type: Boolean, default: false },     // فتح إجباري (يتجاوز الجدول)
  },
  { timestamps: true }
);

export default mongoose.model<IDeliveryStore>("DeliveryStore", storeSchema);
