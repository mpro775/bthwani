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
exports.getNestedCategories = exports.deleteCategory = exports.updateCategory = exports.getCategoriesWithCounts = exports.getAllCategories = exports.createCategory = void 0;
const ProductCategory_1 = require("../../models/market/ProductCategory");
const Product_1 = require("../../models/market/Product");
// إنشاء فئة جديدة
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, image, categoryId, parentCategory } = req.body;
        const category = new ProductCategory_1.ProductCategory({ name, image, categoryId, parentCategory });
        yield category.save();
        res.status(201).json({ message: "Category created", category });
    }
    catch (err) {
        res.status(500).json({ message: "Error creating category", error: err });
    }
});
exports.createCategory = createCategory;
// جلب كل الفئات
const getAllCategories = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield ProductCategory_1.ProductCategory.find().populate("parentCategory", "name");
    res.json(categories);
});
exports.getAllCategories = getAllCategories;
const getCategoriesWithCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield ProductCategory_1.ProductCategory.find().populate("parentCategory");
        // حساب المنتجات المرتبطة بكل فئة
        const counts = yield Product_1.Product.aggregate([
            {
                $group: {
                    _id: "$mainCategory",
                    count: { $sum: 1 },
                },
            },
        ]);
        const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));
        const result = categories.map((cat) => (Object.assign(Object.assign({}, cat.toObject()), { productsCount: countMap.get(cat._id.toString()) || 0 })));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "فشل في تحميل الفئات", error: err });
    }
});
exports.getCategoriesWithCounts = getCategoriesWithCounts;
// ✅ تعديل وحذف فئة
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updated = yield ProductCategory_1.ProductCategory.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: "Error updating category", error: err });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield ProductCategory_1.ProductCategory.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.json({ message: "Category deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting category", error: err });
    }
});
exports.deleteCategory = deleteCategory;
// ✅ استرجاع الفئات بترتيب رئيسي - فرعي
// جلب الفئات بشكل هرمي
const getNestedCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield ProductCategory_1.ProductCategory.find().lean();
        const parentMap = new Map();
        // فصل الفئات الرئيسية
        categories.forEach((cat) => {
            if (!cat.parentCategory) {
                parentMap.set(cat._id.toString(), Object.assign(Object.assign({}, cat), { children: [] }));
            }
        });
        // ربط الفئات الفرعية بالأب
        categories.forEach((cat) => {
            if (cat.parentCategory) {
                const parent = parentMap.get(cat.parentCategory.toString());
                if (parent)
                    parent.children.push(cat);
            }
        });
        res.json(Array.from(parentMap.values()));
    }
    catch (err) {
        res.status(500).json({ message: "فشل في تحميل الفئات الهرمية", error: err });
    }
});
exports.getNestedCategories = getNestedCategories;
