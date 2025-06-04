import { Request, Response } from "express";
import { ProductCategory } from "../../models/Haraj_V2/ProductCategory";
import { Product } from "../../models/Haraj_V2/Product";

// إنشاء فئة جديدة
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, image, categoryId, parentCategory } = req.body;
    const category = new ProductCategory({
      name,
      image,
      categoryId,
      parentCategory,
    });
    await category.save();
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: "Error creating category", error: err });
  }
};

// جلب كل الفئات
export const getAllCategories = async (_: Request, res: Response) => {
  const categories = await ProductCategory.find().populate(
    "parentCategory",
    "name"
  );
  res.json(categories);
};

export const getCategoriesWithCounts = async (req: Request, res: Response) => {
  try {
    const categories = await ProductCategory.find().populate("parentCategory");

    // حساب المنتجات المرتبطة بكل فئة
    const counts = await Product.aggregate([
      {
        $group: {
          _id: "$mainCategory",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const result = categories.map((cat) => ({
      ...cat.toObject(),
      productsCount: countMap.get(cat._id.toString()) || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "فشل في تحميل الفئات", error: err });
  }
};

// ✅ تعديل وحذف فئة
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await ProductCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await ProductCategory.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err });
  }
};
// ✅ استرجاع الفئات بترتيب رئيسي - فرعي
// جلب الفئات بشكل هرمي
export const getNestedCategories = async (req: Request, res: Response) => {
  try {
    const categories = await ProductCategory.find().lean();

    const parentMap = new Map();

    // فصل الفئات الرئيسية
    categories.forEach((cat) => {
      if (!cat.parentCategory) {
        parentMap.set(cat._id.toString(), { ...cat, children: [] });
      }
    });

    // ربط الفئات الفرعية بالأب
    categories.forEach((cat) => {
      if (cat.parentCategory) {
        const parent = parentMap.get(cat.parentCategory.toString());
        if (parent) parent.children.push(cat);
      }
    });

    res.json(Array.from(parentMap.values()));
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تحميل الفئات الهرمية", error: err });
  }
};
