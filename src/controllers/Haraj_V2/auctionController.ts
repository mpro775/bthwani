import { Request, Response } from "express";
import { Product } from "../../models/Haraj_V2/Product";
import mongoose, { Types } from "mongoose";

export const placeBid = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.user?.id;

  const product = await Product.findById(id);
  if (!product || !product.isAuction || product.auctionStatus !== "open") {
    res.status(400).json({ message: "المزاد غير متاح" });
    return;
  }

  const now = new Date();
  if (new Date(product.auctionEndDate) < now) {
    res.status(400).json({ message: "انتهى المزاد" });
    return;
  }

  const currentHighest =
    product.bids?.[product.bids.length - 1]?.amount || product.startingPrice;

  if (amount <= currentHighest) {
    res.status(400).json({ message: "المبلغ أقل من أعلى مزايدة حالية" });
    return;
  }

  if (!userId) {
    res.status(401).json({ message: "مطلوب تسجيل الدخول" });
    return;
  }

  product.bids.push({
    userId: new mongoose.Types.ObjectId(userId),
    amount,
    at: new Date(),
  });
  res.status(200).json({ message: "تم تقديم المزايدة بنجاح" });
};
