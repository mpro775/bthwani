import mongoose, { Schema, Document } from "mongoose";

interface ISheinOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: {
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    productUrl?: string;
  }[];
  totalPrice: number;
  status: "paid" | "pending" | "cancelled";
  paidAt?: Date;
  createdAt: Date;
}

const SheinOrderSchema = new Schema<ISheinOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        imageUrl: String,
        productUrl: String,
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["paid", "pending", "cancelled"],
      default: "pending",
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const SheinOrder = mongoose.model<ISheinOrder>("SheinOrder", SheinOrderSchema);
export { SheinOrder, ISheinOrder };
