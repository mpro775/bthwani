import mongoose, { Document, Schema } from "mongoose";

export interface IDeliveryCategory extends Document {
  name: string;
  image?: string;
  description?: string;
  parent?: mongoose.Types.ObjectId;           // فئة أصلية (للتصنيفات المتداخلة)
  pricingStrategy?: mongoose.Types.ObjectId;
}

const deliveryCategorySchema = new Schema<IDeliveryCategory>({
  name:        { type: String, required: true },
  image:       { type: String },
  description: { type: String },
  parent:      { type: Schema.Types.ObjectId, ref: "DeliveryCategory" },
  pricingStrategy: { type: Schema.Types.ObjectId, ref: "PricingStrategy" },
}, { timestamps: true });

export default mongoose.model<IDeliveryCategory>(
  "DeliveryCategory",
  deliveryCategorySchema
);
