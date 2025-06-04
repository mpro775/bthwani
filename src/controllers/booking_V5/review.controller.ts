// controllers/review.controller.ts
import { Request, Response } from "express";

import reviewModel from "../../models/booking_V5/review.model";
import mongoose from "mongoose";
import bookingModel from "../../models/booking_V5/booking.model";

export const getServiceReviews = async (req: Request, res: Response) => {
  const serviceId = req.params.id;

  const reviews = await reviewModel
    .find({ serviceId })
    .populate("userId", "fullName profileImage");
  const avg = await reviewModel.aggregate([
    { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  res.json({ average: avg[0]?.avgRating || 0, reviews });
};
export const submitReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user?.id;
    const serviceId = req.params.id;

    const completed = await bookingModel.findOne({
      serviceId,
      userId,
      status: "completed",
    });
    if (!completed) {
      res.status(403).json({ message: "لا يمكنك التقييم دون حجز مكتمل" });
      return;
    }

    const existing = await reviewModel.findOne({ serviceId, userId });
    if (existing) {
      res.status(400).json({ message: "تم التقييم مسبقاً" });
      return;
    }

    const review = await reviewModel.create({
      serviceId,
      userId,
      rating,
      comment,
    });
    res.status(201).json({ message: "تم إرسال التقييم", review });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء إرسال التقييم", error: err });
  }
};
