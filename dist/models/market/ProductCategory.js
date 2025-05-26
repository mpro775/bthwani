"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productCategorySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    categoryId: { type: String, unique: true },
    parentCategory: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "ProductCategory" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.ProductCategory = mongoose_1.default.model("ProductCategory", productCategorySchema);
