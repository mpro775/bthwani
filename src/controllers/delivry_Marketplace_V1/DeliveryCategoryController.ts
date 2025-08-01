import { Request, Response } from "express";
import DeliveryCategory from "../../models/delivry_Marketplace_V1/DeliveryCategory";

// Create
export const create = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body.image) {
      res.status(400).json({ message: "Image URL is required" });
      return;
    }
    if (!body.name) {
res.status(400).json({ message: "Name is required" });
      return;
    } 

    const data = new DeliveryCategory(body);
    await data.save();

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
export const getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const data = await DeliveryCategory.find(filter);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getChildren = async (req, res) => {
  try {
    const { parentId } = req.params;
    const data = await DeliveryCategory.find({ parent: parentId });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Read by ID
export const getById = async (req: Request, res: Response) => {
  try {
    const data = await DeliveryCategory.findById(req.params.id);
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
    const body = req.body;

    const updated = await DeliveryCategory.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Category not found" });
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
    await DeliveryCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "DeliveryCategory deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getMainCategories = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {
      parent: null, // فقط الرئيسية
      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
    };
    const data = await DeliveryCategory.find(filter);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};