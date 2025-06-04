// controllers/admin/vendorController.ts
import { Request, Response } from "express";
import Vendor from "../../models/vendor_app/Vendor";

export const addVendor = async (req: Request, res: Response) => {
  const { userId, storeId } = req.body;
  const existing = await Vendor.findOne({ userId });
  if (existing) {
    res.status(400).json({ error: "Vendor already exists" });
    return;
  }

  const vendor = new Vendor({ userId, storeId });
  await vendor.save();
  res.status(201).json(vendor);
};
