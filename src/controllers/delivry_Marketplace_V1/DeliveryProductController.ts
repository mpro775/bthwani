import { Request, Response } from "express";
import DeliveryProduct from "../../models/delivry_Marketplace_V1/DeliveryProduct";

// Create
export const create = async (req: Request, res: Response) => {
  try {
    const data = new DeliveryProduct(req.body);
    if (!req.body.image) {
      res.status(400).json({ message: "Image URL is required" });
      return;
    }
    data.image = req.body.image;

    await data.save();
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await DeliveryProduct.find();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Read by ID
export const getById = async (req: Request, res: Response) => {
  try {
    const data = await DeliveryProduct.findById(req.params.id);
    if (!data) {
      res.status(404).json({ message: "Not found" });
      res.json(data);
      return;
    }
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
    );

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
    res.json({ message: "DeliveryProduct deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
