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
exports.adminUpdateProduct = exports.adminGetAllProducts = void 0;
const Product_1 = require("../../models/market/Product");
// عرض جميع المنتجات مع فلاتر
const adminGetAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isApproved, isActive } = req.query;
    const filter = {};
    if (isApproved !== undefined)
        filter.isApproved = isApproved === "true";
    if (isActive !== undefined)
        filter.isActive = isActive === "true";
    const products = yield Product_1.Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
});
exports.adminGetAllProducts = adminGetAllProducts;
// تحديث حالة المنتج (موافقة، إيقاف)
const adminUpdateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield Product_1.Product.findById(req.params.id);
    if (!product) {
        res.status(404).json({ message: "Not found" });
        return;
    }
    const { isApproved, isActive } = req.body;
    if (typeof isApproved === "boolean")
        product.isApproved = isApproved;
    if (typeof isActive === "boolean")
        product.isActive = isActive;
    yield product.save();
    res.json({ message: "Updated", product });
});
exports.adminUpdateProduct = adminUpdateProduct;
