import { Request, Response } from "express";
import { Product } from "../../models/Haraj_V2/Product";

// عرض جميع المنتجات مع فلاتر
export const adminGetAllProducts = async (req: Request, res: Response) => {
  const { isApproved, isActive } = req.query;
  const filter: any = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === "true";
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
};

// تحديث حالة المنتج (موافقة، إيقاف)
export const adminUpdateProduct = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const { isApproved, isActive } = req.body;
  if (typeof isApproved === "boolean") product.isApproved = isApproved;
  if (typeof isActive === "boolean") product.isActive = isActive;

  await product.save();
  res.json({ message: "Updated", product });
};
