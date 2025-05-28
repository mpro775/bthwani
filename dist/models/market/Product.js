"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mediaSchema = new mongoose_1.default.Schema({
    type: { type: String, enum: ["image", "video"], required: true },
    uri: { type: String, required: true },
}, { _id: false });
const commentSchema = new mongoose_1.default.Schema({
    user: { type: String, required: true }, // firebaseUID أو ObjectId لاحقًا
    text: { type: String, required: true },
}, { timestamps: true, _id: false });
const socialSharesSchema = new mongoose_1.default.Schema({
    whatsapp: { type: Number, default: 0 },
    facebook: { type: Number, default: 0 },
}, { _id: false });
const specsSchema = new mongoose_1.default.Schema({
    brand: String,
    model: String,
    year: Number,
    material: String,
    color: String,
}, { _id: false });
const productSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: Number,
    hasOffer: { type: Boolean, default: false },
    remainingTime: String,
    media: [mediaSchema],
    description: String,
    mainCategory: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.Product = mongoose_1.default.model("Product", productSchema);
