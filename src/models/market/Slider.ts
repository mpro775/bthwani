import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
  image: { type: String, required: true },
  category: { type: String }, // أو ObjectId إن كنت تربطه بفئة
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });


export const Slider = mongoose.model("Slider", sliderSchema);
