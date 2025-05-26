"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slider = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const sliderSchema = new mongoose_1.default.Schema({
    image: { type: String, required: true },
    category: { type: String }, // أو ObjectId إن كنت تربطه بفئة
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });
exports.Slider = mongoose_1.default.model("Slider", sliderSchema);
