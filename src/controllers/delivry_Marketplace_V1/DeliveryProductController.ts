import { Request, Response } from "express";
import DeliveryProduct from "../../models/delivry_Marketplace_V1/DeliveryProduct";
import Vendor from "../../models/vendor_app/Vendor";
import StoreSection from "../../models/delivry_Marketplace_V1/StoreSection";
import mongoose from "mongoose";

// Create
export const create = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // تأكد من وجود متجر وقسم داخلي في البدي
    if (!body.store) {
      res.status(400).json({ message: "storeId is required" });
      return;
    }
    if (!body.subCategory) {
      res.status(400).json({ message: "subCategory (الفئة الداخلية) مطلوب" });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(body.store) || !mongoose.Types.ObjectId.isValid(body.subCategory)) {
      res.status(400).json({ message: "Invalid storeId or subCategory" });
      return;
    }

    // تحقق أن القسم فعلاً يتبع المتجر
    const section = await StoreSection.findById(body.subCategory);
    if (!section || section.store.toString() !== body.store) {
      res.status(400).json({ message: "فئة داخلية غير صالحة أو لا تتبع المتجر" });
      return;
    }

    // للـ vendor فقط: تحقق أنه يملك هذا المتجر
    if (req.user.role === "vendor") {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        res.status(403).json({ message: "ليس لديك حساب تاجر" });
        return
      }
      if (vendor.store.toString() !== body.store) {
        res
          .status(403)
          .json({ message: "ليس لديك صلاحية إضافة منتج لهذا المتجر" });
        return;
      }
    }

    // تأكد من وجود صورة
    if (!body.image) {
      res.status(400).json({ message: "Image URL is required" });
      return;
    }

    const product = new DeliveryProduct(body);
    await product.save();

    res.status(201).json(product);
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Read all
export const getAll = async (req: Request, res: Response) => {
  try {
    // دعم الفلترة حسب المتجر/القسم الفرعي
    const filter: any = {};
    if (req.query.store) filter.store = req.query.store;
    if (req.query.subCategory) filter.subCategory = req.query.subCategory;
    const data = await DeliveryProduct.find(filter).populate("subCategory");
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Read by ID
export const getById = async (req: Request, res: Response) => {
  try {
    const data = await DeliveryProduct.findById(req.params.id).populate("subCategory");
    if (!data) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update
export const update = async (req: Request, res: Response) => {
  try {
    const updated = await DeliveryProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("subCategory");

    // تحقق من القسم إذا تم تعديله
    if (req.body.subCategory) {
      const section = await StoreSection.findById(req.body.subCategory);
      if (!section || section.store.toString() !== req.body.store) {
        res.status(400).json({ message: "فئة داخلية غير صالحة أو لا تتبع المتجر" });
        return;
      }
    }

    // للـ vendor فقط: تحقق أنه يملك هذا المتجر
    if (req.user.role === "vendor") {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        res.status(403).json({ message: "ليس لديك حساب تاجر" });
        return;
      }
      if (vendor.store.toString() !== req.body.store) {
        res
          .status(403)
          .json({ message: "ليس لديك صلاحية إضافة منتج لهذا المتجر" });
        return;
      }
    }

    if (!updated) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
export const remove = async (req: Request, res: Response) => {
  try {
    await DeliveryProduct.findByIdAndDelete(req.params.id);
    if (req.user.role === "vendor") {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        res.status(403).json({ message: "ليس لديك حساب تاجر" });
        return;
      }
      // ملاحظة: هنا يفضل جلب المنتج أولاً ثم تحقق أن المتجر مطابق وليس body.store!
    }
    res.json({ message: "DeliveryProduct deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
