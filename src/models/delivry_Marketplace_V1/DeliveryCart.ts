import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  product?: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  store: mongoose.Types.ObjectId;
  image?: string;
  isCustom?: boolean;
  customPrice?: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  store: mongoose.Types.ObjectId;
  total: number;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "DeliveryProduct" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    store: { type: Schema.Types.ObjectId, ref: "DeliveryStore", required: true },
    image: { type: String },
    isCustom: { type: Boolean, default: false },
    customPrice: { type: Number },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>({
  user:  { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [cartItemSchema], default: [] },
  store: { type: Schema.Types.ObjectId, ref: "DeliveryStore", required: true },
  total: { type: Number, required: true },
}, { timestamps: true });

cartSchema.index({ user: 1 });
cartSchema.index({ store: 1 });

export default mongoose.model<ICart>(
  "DeliveryCart",
  cartSchema
);
