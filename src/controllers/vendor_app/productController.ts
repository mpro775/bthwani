// controllers/vendor/productController.ts
import { Request, Response } from "express";
import { Product } from "../../models/Haraj_V2/Product";

export const createProduct = async (req: any, res: Response) => {
  const { name, price, description } = req.body;
  const product = new Product({
    name,
    price,
    description,
    storeId: req.vendor.storeId,
  });
  await product.save();
  res.status(201).json(product);
};
