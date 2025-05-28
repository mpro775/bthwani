"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/market/categoryController");
const verifyFirebase_1 = require("../middleware/verifyFirebase");
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const categoryController_2 = require("../controllers/market/categoryController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "temp/" });
router.post("/", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, categoryController_1.createCategory);
router.get("/", categoryController_2.getCategoriesWithCounts);
// فئات - Admin فقط
router.patch("/:id", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, categoryController_1.updateCategory);
router.delete("/:id", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, categoryController_1.deleteCategory);
router.get("/nested", categoryController_1.getNestedCategories);
exports.default = router;
