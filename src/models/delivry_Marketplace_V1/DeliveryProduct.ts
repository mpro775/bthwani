import mongoose, { Document, Schema } from "mongoose";

export interface IDeliveryProduct extends Document {
  store: mongoose.Types.ObjectId;
  subCategory?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isDailyOffer: boolean;
  variants?: { name: string; price: number }[];
}

const productSchema = new Schema<IDeliveryProduct>({
  store:        { type: Schema.Types.ObjectId, ref: "DeliveryStore", required: true },
  subCategory:  { type: Schema.Types.ObjectId, ref: "DeliveryProductSubCategory" },
  name:         { type: String, required: true },
  description:  { type: String },
  price:        { type: Number, required: true },
  image:        { type: String },
  isAvailable:  { type: Boolean, default: true },
  isDailyOffer: { type: Boolean, default: false },
  variants: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

export default mongoose.model<IDeliveryProduct>(
  "DeliveryProduct",
  productSchema
);
