import mongoose, { Document, Schema } from "mongoose";

export interface IDeliveryProductSubCategory extends Document {
  store: mongoose.Types.ObjectId;
  name: string;
}

const subCategorySchema = new Schema<IDeliveryProductSubCategory>({
  store: { type: Schema.Types.ObjectId, ref: "DeliveryStore", required: true },
  name:  { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IDeliveryProductSubCategory>(
  "DeliveryProductSubCategory",
  subCategorySchema
);
