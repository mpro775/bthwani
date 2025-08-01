import mongoose, { Document, Schema } from "mongoose";

export interface IDeliveryCategory extends Document {
  name: string;
  image?: string;
  description?: string;
  isActive:boolean;
  usageType:string;
  parent?: mongoose.Types.ObjectId;           // فئة أصلية (للتصنيفات المتداخلة)
}

const deliveryCategorySchema = new Schema<IDeliveryCategory>({
  name:        { type: String, required: true },
  image:       { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  usageType:   { type: String, enum: ["grocery", "restaurant", "retail"], required: true },

  parent:      { type: Schema.Types.ObjectId, ref: "DeliveryCategory" },
}, { timestamps: true });

export default mongoose.model<IDeliveryCategory>(
  "DeliveryCategory",
  deliveryCategorySchema
);
