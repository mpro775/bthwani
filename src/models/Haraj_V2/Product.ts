import mongoose from "mongoose";
import { Types } from "mongoose";
import { Document } from "mongoose";

export interface ProductType extends Document {
  name: string;
  price: number;
  hasOffer: boolean;
  offerPrice?: number;
isAuction?: boolean;
auctionEndDate?: Date;
priceHistory?: { price: number; changedAt: Date }[];

startingPrice?: number;
  bids?: { userId: Types.ObjectId; amount: number; at: Date }[];
  winningBid?: { userId: Types.ObjectId; amount: number };
auctionStatus?: "open" | "closed";

  media: { type: "image" | "video"; uri: string }[];
  description: string;
mainCategory: mongoose.Types.ObjectId;
  categoryId: string;
  user?:  Types.ObjectId;
  condition: "new" | "used";
  warranty: boolean;
  delivery: boolean;
  specs?: { brand?: string; model?: string; year?: number; material?: string; color?: string };
  rating: number;
  remainingTime?: string;
  socialShares: { whatsapp: number; facebook: number };
  viewsCount: number;
  comments: { user: mongoose.Types.ObjectId; text: string }[];
  likes: string[];
  favoritesCount: Number;
firebaseUID:string;
  isActive: boolean;
  isApproved?: boolean;
}

const priceHistorySchema = new mongoose.Schema({
  price: Number,
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ["image", "video"], required: true },
  uri: { type: String, required: true },
}, { _id: false });

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
}, { timestamps: true });

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
  favoritesCount: { type: Number, default: false }, // هل الإعلان بنظام المزاد
firebaseUID: { type: String, required: true },

  isAuction: { type: Boolean, default: false }, // هل الإعلان بنظام المزاد
auctionEndDate: Date,                         // وقت نهاية المزاد
startingPrice: Number,                        // السعر الابتدائي
bids: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    at: { type: Date, default: Date.now },
  }
],
  priceHistory: [priceHistorySchema],

winningBid: {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
},
auctionStatus: { type: String, enum: ["open", "closed"], default: "open" },


  media: [mediaSchema],
  description: String,
mainCategory: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ProductCategory",
  required: true
},

user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },


governorate: {
  type: String,
  enum: [
    "صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", "حجة", "المكلا",
    "مأرب", "الجوف", "عمران", "صعدة", "شبوة", "لحج", "الضالع",
    "المهرة", "ريمة", "البيضاء"
  ],
  required: true,
},
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
