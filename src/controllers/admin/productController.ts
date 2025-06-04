import { Request, Response } from "express";
import { Product } from "../../models/Haraj_V2/Product";

export const getPendingProducts = async (req: Request, res: Response) => {
  const products = await Product.find({ status: "pending" });
  res.json(products);
};

export const updateProductStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
};
