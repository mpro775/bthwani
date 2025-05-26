"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bannerControllers_1 = require("../controllers/market/bannerControllers");
const verifyFirebase_1 = require("../middleware/verifyFirebase");
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "temp/" });
const router = (0, express_1.Router)();
router.get("/", bannerControllers_1.getSliders);
router.post("/", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, bannerControllers_1.createSlider);
exports.default = router;
