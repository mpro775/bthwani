// src/models/delivry/DeliveryCart.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  storeId: mongoose.Types.ObjectId;
  image?: string;
}

export interface ICart extends Document {
  cartId?: string;
  userId?:string;
  items: ICartItem[];
  storeId: mongoose.Types.ObjectId;
  total: number;
  createdAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'DeliveryProduct', required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true },
  storeId:   { type: Schema.Types.ObjectId, ref: 'DeliveryStore', required: true },
  image:     { type: String }
}, { _id: false });

const cartSchema = new Schema<ICart>({
  cartId:    { type: String },
  userId:    { type: String },       // <— غيّرت هنا من ObjectId إلى String
  items:     { type: [cartItemSchema], default: [] },
  storeId:   { type: Schema.Types.ObjectId, ref: 'DeliveryStore', required: true },
  total:     { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

cartSchema.index({ cartId: 1 });
cartSchema.index({ userId: 1 });

export default mongoose.model<ICart>('DeliveryCart', cartSchema);
