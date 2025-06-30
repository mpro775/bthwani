import mongoose, { Schema, Document } from "mongoose";

interface IWorkSchedule {
  day: string;       
  open: boolean;
  from?: string;      // أصبح اختياري
  to?: string;        // أصبح اختياري
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
  commissionRate:number;
  takeCommission:boolean;
  pricingStrategy?: mongoose.Types.ObjectId;
  deliveryDiscountRate?: number;
}

const storeSchema = new Schema<IDeliveryStore>({
  name:        { type: String, required: true },
  address:     { type: String, required: true },
  category:    { type: Schema.Types.ObjectId, ref: "DeliveryCategory", required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
   commissionRate: {      // نسبة العمولة (مثال: 0.10 تعني 10%)
    type: Number,
    default: 0
  },
  takeCommission: {      // هل يأخذ المتجر عمولة أم لا؟
    type: Boolean,
    default: true
  },
  isActive:    { type: Boolean, default: true },
  image:       { type: String },
  logo:        { type: String },
  forceClosed: { type: Boolean, default: false },
  forceOpen:   { type: Boolean, default: false },
  schedule: [
    {
      day:  { type: String, required: true },
      open: { type: Boolean, default: false },
      from: String,
      to:   String,
    }
  ],
  pricingStrategy: { type: Schema.Types.ObjectId, ref: "PricingStrategy" },
  deliveryDiscountRate: { type: Number, default: 0 },
 
}, { timestamps: true });

export default mongoose.model<IDeliveryStore>(
  "DeliveryStore",
  storeSchema
);
