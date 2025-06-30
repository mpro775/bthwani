import mongoose, { Document, Schema } from "mongoose";

export interface IVendor extends Document {
  fullName: string;
  phone: string;
  email?: string;
  password: string;

  store: mongoose.Types.ObjectId;    // المتجر الذي يديره
  isActive: boolean;                 // مفعل/موقوف

  // إحصائيات مبسطة للتاجر
  salesCount: number;                // عدد المبيعات
  totalRevenue: number;              // إجمالي الإيرادات

  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>({
  fullName:     { type: String, required: true },
  phone:        { type: String, required: true, unique: true },
  email:        { type: String },
  password:     { type: String, required: true },

  store:        { type: Schema.Types.ObjectId, ref: "DeliveryStore", required: true },
  isActive:     { type: Boolean, default: true },

  salesCount:   { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IVendor>("Vendor", VendorSchema);
