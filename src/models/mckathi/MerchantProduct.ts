// models/MerchantProduct.ts
import { Schema, model, Types, Document } from "mongoose";

export interface IMerchantProductAttribute {
  attribute: Types.ObjectId;
  value: string;
  displayValue?: string;
}

export interface IMerchantProduct extends Document {
  merchant: Types.ObjectId;   // التاجر (Vendor)
  store: Types.ObjectId;      // المتجر (DeliveryStore)
  product: Types.ObjectId;    // المنتج المركزي (ProductCatalog)
  price: number;
  stock?: number;
  isAvailable: boolean;
  customImage?: string;
  section?: Types.ObjectId;
  customDescription?: string;
  customAttributes?: IMerchantProductAttribute[];
  createdAt: Date;
  updatedAt: Date;
  sellingUnit:string;
}

const MerchantProductAttributeSchema = new Schema<IMerchantProductAttribute>({
  attribute: { type: Schema.Types.ObjectId, ref: "Attribute", required: true },
  value: { type: String, required: true },
  displayValue: { type: String },
});

const MerchantProductSchema = new Schema<IMerchantProduct>(
  {
    merchant: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    store: { type: Schema.Types.ObjectId, ref: "DeliveryStore", required: true }, // <<<<< الجديد
    product: { type: Schema.Types.ObjectId, ref: "ProductCatalog", required: true },
    price: { type: Number, required: true },
    stock: { type: Number },
    isAvailable: { type: Boolean, default: true },
    customImage: { type: String },
    customDescription: { type: String },
    sellingUnit: { type: String },
section: { type: Schema.Types.ObjectId, ref: "StoreSection" },
    customAttributes: [MerchantProductAttributeSchema],
  },
  { timestamps: true }
);

export default model<IMerchantProduct>("MerchantProduct", MerchantProductSchema);
