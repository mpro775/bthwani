// models/delivery_Marketplace_V1/Promotion.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPromotion extends Document {
  title?: string;
  description?: string;
  image?: string;
  link?: string;                // للرابط الخارجي أو داخلي
  target: "product" | "store" | "category";
  value?: number;               // قيمة الخصم
  valueType?: "percentage" | "fixed";
  product?: mongoose.Types.ObjectId;
  store?: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  order?: number;               // لترتيب الظهور
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

const promotionSchema = new Schema<IPromotion>(
  {
    title:       { type: String },
    description: { type: String },
    image:       { type: String },
    link:        { type: String },
    target:      { type: String, enum: ["product", "store", "category"], required: true },
    value:       { type: Number },
    valueType:   { type: String, enum: ["percentage", "fixed"] },
    product:     { type: Schema.Types.ObjectId, ref: "DeliveryProduct" },
    store:       { type: Schema.Types.ObjectId, ref: "DeliveryStore" },
    category:    { type: Schema.Types.ObjectId, ref: "DeliveryCategory" },
    order:       { type: Number, default: 0 },
    startDate:   { type: Date },
    endDate:     { type: Date },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPromotion>(
  "DeliveryPromotion",
  promotionSchema
);
