import mongoose from "mongoose";
import { Document } from "mongoose";

export interface ProductType extends Document {
  name: string;
  price: number;
  hasOffer: boolean;
  offerPrice?: number;
  media: { type: "image" | "video"; uri: string }[];
  description: string;
  category: string;
  categoryId: string;
  user?: { name: string; phone: string; profileImage: string };
  condition: "new" | "used";
  warranty: boolean;
  delivery: boolean;
  specs?: { brand?: string; model?: string; year?: number; material?: string; color?: string };
  rating: number;
  remainingTime?: string;
  socialShares: { whatsapp: number; facebook: number };
  viewsCount: number;
  comments: { user: string; text: string }[];
  likes: string[];
  isActive: boolean;
  isApproved: boolean;
}

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ["image", "video"], required: true },
  uri: { type: String, required: true },
}, { _id: false });

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true }, // firebaseUID أو ObjectId لاحقًا
  text: { type: String, required: true },
}, { timestamps: true, _id: false });

const socialSharesSchema = new mongoose.Schema({
  whatsapp: { type: Number, default: 0 },
  facebook: { type: Number, default: 0 },
}, { _id: false });

const specsSchema = new mongoose.Schema({
  brand: String,
  model: String,
  year: Number,
  material: String,
  color: String,
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: Number,
  hasOffer: { type: Boolean, default: false },
  remainingTime: String,

  media: [mediaSchema],
  description: String,
mainCategory: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ProductCategory",
  required: true
},

  user: {
    name: String,
    phone: String,
    profileImage: String,
  },

  location: String,
  condition: { type: String, enum: ["new", "used"], default: "new" },
  warranty: { type: Boolean, default: false },
  delivery: { type: Boolean, default: false },

  specs: specsSchema,
  rating: { type: Number, default: 0 },

  viewsCount: { type: Number, default: 0 },
  comments: [commentSchema],
  socialShares: socialSharesSchema,

  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

export const Product = mongoose.model<ProductType>("Product", productSchema);
