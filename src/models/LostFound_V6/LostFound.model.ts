import mongoose from "mongoose";

const LostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ["lost", "found"], required: true },
  title: String,
  description: String,
  category: String,
  subCategory: String,
  subSubCategory: String,
  images: [String],
  reward: { type: Number, default: 0 },
  location: {
    lat: Number,
    lng: Number,
    city: String,
  },
  rewardOffered: {
  type: Boolean,
  default: false,
},
rewardAmount: {
  type: Number,
  default: 0,
},
rewardMethod: {
  type: String,
  enum: ['cash', 'wallet'],
  default: 'cash',
},

  dateLostOrFound: Date,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["active", "resolved", "archived"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
});

export const LostFound = mongoose.model("LostFound", LostFoundSchema);
