import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  categoryId: { type: String, unique: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const ProductCategory = mongoose.model("ProductCategory", productCategorySchema);
