"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/market/productController");
const verifyFirebase_1 = require("../middleware/verifyFirebase");
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "temp/" });
const router = (0, express_1.Router)();
router.post("/products", verifyFirebase_1.verifyFirebase, productController_1.createProduct);
router.get("/admin/products", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, productController_1.getAllProducts); // هذا يرجع كل المنتجات
router.get("/products/:id", productController_1.getProductById);
router.patch("/products/:id", verifyFirebase_1.verifyFirebase, productController_1.updateProduct);
router.delete("/products/:id", verifyFirebase_1.verifyFirebase, productController_1.deleteProduct);
router.patch("/products/:id/like", verifyFirebase_1.verifyFirebase, productController_1.toggleLikeProduct);
router.post("/products/:id/comment", verifyFirebase_1.verifyFirebase, productController_1.addComment);
router.patch("/products/:id/status", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, productController_1.adminUpdateStatus);
router.get("/products", productController_1.getFilteredProducts); // هذا يدعم الفلاتر: category, condition, hasOffer
router.get("/products/active-offers", productController_1.getActiveOffers);
router.get("/products/:id/similar", productController_1.getSimilarProducts);
exports.default = router;
