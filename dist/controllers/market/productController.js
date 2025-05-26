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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarProducts = exports.getActiveOffers = exports.getFilteredProducts = exports.getUnapprovedProducts = exports.adminUpdateStatus = exports.addComment = exports.toggleLikeProduct = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const Product_1 = require("../../models/market/Product");
const user_1 = require("../../models/user");
const ProductCategory_1 = require("../../models/market/ProductCategory");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        console.log("✅ Received body:", req.body);
        console.log("✅ Received files:", req.files);
        const uid = req.user.uid;
        const userDoc = yield user_1.User.findOne({ firebaseUID: uid });
        if (!userDoc) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const _b = req.body, { mainCategory } = _b, rest = __rest(_b, ["mainCategory"]);
        const category = yield ProductCategory_1.ProductCategory.findById(mainCategory);
        if (!category) {
            res.status(400).json({ message: "Invalid category" });
            return;
        }
        // ✅ رفع الصور إلى BunnyCDN
        let media = [];
        try {
            media = JSON.parse(req.body.media); // ← تأكد أنها مصفوفة نصوص
        }
        catch (_c) {
            res.status(400).json({ message: "Invalid media format" });
            return;
        }
        const product = new Product_1.Product(Object.assign(Object.assign({}, rest), { media,
            mainCategory, mainCategoryName: category.name, user: {
                name: userDoc.fullName,
                phone: userDoc.phone,
                profileImage: userDoc.profileImage,
            } }));
        yield product.save();
        userDoc.postsCount++;
        yield userDoc.save();
        res.status(201).json(product);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating product", error: err });
    }
});
exports.createProduct = createProduct;
// جلب جميع المنتجات (للمستخدمين)
const getAllProducts = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.Product.find({ isActive: true, isApproved: true }).sort({ createdAt: -1 });
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching products", error: err });
    }
});
exports.getAllProducts = getAllProducts;
// جلب منتج واحد
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        product.viewsCount++;
        yield product.save();
        res.json(product);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching product", error: err });
    }
});
exports.getProductById = getProductById;
// تعديل منتج (المالك فقط)
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // لاحقًا يمكننا فحص التحقق من الملكية
        Object.assign(product, req.body);
        yield product.save();
        res.json({ message: "Product updated", product });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating product", error: err });
    }
});
exports.updateProduct = updateProduct;
// حذف منتج (soft delete)
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json({ message: "Product deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err });
    }
});
exports.deleteProduct = deleteProduct;
// ✅ Toggle إعجاب منتج
const toggleLikeProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const uid = req.user.uid;
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const index = product.likes.indexOf(uid);
        if (index > -1) {
            product.likes.splice(index, 1); // إلغاء إعجاب
        }
        else {
            product.likes.push(uid); // إضافة إعجاب
        }
        yield product.save();
        res.json({ message: "Like toggled", likesCount: product.likes.length });
    }
    catch (err) {
        res.status(500).json({ message: "Error toggling like", error: err });
    }
});
exports.toggleLikeProduct = toggleLikeProduct;
// ✅ إضافة تعليق
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const uid = req.user.uid;
        const user = yield user_1.User.findOne({ firebaseUID: uid });
        const { text } = req.body;
        if (!user || !text) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        product.comments.push({ user: user.fullName || uid, text });
        yield product.save();
        res.json({ message: "Comment added", comments: product.comments });
    }
    catch (err) {
        res.status(500).json({ message: "Error adding comment", error: err });
    }
});
exports.addComment = addComment;
// ✅ تغيير حالة الموافقة/التفعيل
const adminUpdateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const { isApproved, isActive } = req.body;
        if (typeof isApproved === "boolean")
            product.isApproved = isApproved;
        if (typeof isActive === "boolean")
            product.isActive = isActive;
        yield product.save();
        res.json({ message: "Status updated", product });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating status", error: err });
    }
});
exports.adminUpdateStatus = adminUpdateStatus;
// 🔍 جلب المنتجات غير المعتمدة
const getUnapprovedProducts = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.Product.find({ isApproved: false }).sort({ createdAt: -1 });
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching unapproved products", error: err });
    }
});
exports.getUnapprovedProducts = getUnapprovedProducts;
// ✅ فلترة المنتجات حسب التصنيف والسعر والحالة
// GET /market/products?category=...&minPrice=...&maxPrice=...&condition=...
const getFilteredProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = { isActive: true, isApproved: true };
        const getString = (val, fallback = "") => (typeof val === "string" ? val : fallback);
        const getNumber = (val, fallback = 0) => {
            const parsed = parseInt(getString(val));
            return isNaN(parsed) ? fallback : parsed;
        };
        const category = getString(req.query.category);
        const condition = getString(req.query.condition);
        const search = getString(req.query.search);
        const hasOffer = getString(req.query.hasOffer);
        if (category)
            filter.category = category;
        if (condition)
            filter.condition = condition;
        if (hasOffer === "true")
            filter.hasOffer = true;
        if (search)
            filter.name = { $regex: search, $options: "i" };
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            const minPrice = getNumber(req.query.minPrice);
            const maxPrice = getNumber(req.query.maxPrice);
            if (minPrice > 0)
                filter.price.$gte = minPrice;
            if (maxPrice > 0)
                filter.price.$lte = maxPrice;
        }
        const page = getNumber(req.query.page, 1);
        const limit = getNumber(req.query.limit, 10);
        const products = yield Product_1.Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ message: "Error filtering products", error: err });
    }
});
exports.getFilteredProducts = getFilteredProducts;
// ✅ عرض المنتجات التي تحتوي على عرض قائم (حسب remainingTime)
// GET /market/products/active-offers
const getActiveOffers = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const products = yield Product_1.Product.find({
            isApproved: true,
            isActive: true,
            hasOffer: true,
            offerExpiresAt: { $gt: now }
        }).sort({ offerExpiresAt: 1 });
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching active offers", error: err });
    }
});
exports.getActiveOffers = getActiveOffers;
// ✅ منتجات مشابهة حسب التصنيف أو الكلمات المفتاحية
// GET /market/products/:id/similar
const getSimilarProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const similar = yield Product_1.Product.find({
            _id: { $ne: product._id },
            category: product.category,
            isActive: true,
            isApproved: true
        }).limit(10);
        res.json(similar);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching similar products", error: err });
    }
});
exports.getSimilarProducts = getSimilarProducts;
