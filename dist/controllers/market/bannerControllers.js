"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSlider = exports.getSliders = void 0;
const Slider_1 = require("../../models/market/Slider");
const getSliders = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sliders = yield Slider_1.Slider.find({ isActive: true }).sort({ order: 1 });
        res.json(sliders);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching sliders", error: err });
    }
});
exports.getSliders = getSliders;
const createSlider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, image } = req.body;
        if (!image) {
            res.status(400).json({ message: "Image URL is required" });
            return;
        }
        const newSlider = new Slider_1.Slider({ image, category });
        yield newSlider.save();
        res.status(201).json({ message: "Slider created", slider: newSlider });
    }
    catch (err) {
        res.status(500).json({ message: "Error creating slider", error: err });
    }
});
exports.createSlider = createSlider;
