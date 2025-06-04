import { Request, Response } from "express";
import { Booking } from "../../models/job_V3/booking.model";
import { User } from "../../models/user";
import { Review } from "../../models/job_V3/review.model";

export const submitReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const freelancerId = req.params.freelancerId;
    const userId = req.user?.id;

    if (!rating || !freelancerId) {
      res.status(400).json({ message: "البيانات ناقصة" });
      return;
    }

    const booking = await Booking.findOne({
      userId,
      freelancerId,
      status: "completed",
    });

    if (!booking) {
      res.status(403).json({ message: "لا يمكنك تقييم دون حجز مكتمل" });
      return;
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || !freelancer.isFreelancer) {
      res.status(404).json({ message: "المستقل غير موجود" });
      return;
    }

    // تحقق من وجود تقييم مسبق في Review collection
    const existing = await Review.findOne({ userId, freelancerId });
    if (existing) {
      res.status(400).json({ message: "تم التقييم مسبقًا" });
      return;
    }

    // إنشاء مراجعة جديدة
    await Review.create({
      userId,
      freelancerId,
      rating,
      comment,
    });

    res.status(201).json({ message: "تم إرسال التقييم" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء إرسال التقييم", error: err });
  }
};

export const getFreelancerReviews = async (req: Request, res: Response) => {
  try {
    const freelancerId = req.params.freelancerId;
    const freelancer = await User.findById(freelancerId);

    if (!freelancer || !freelancer.isFreelancer) {
      res.status(404).json({ message: "المستقل غير موجود" });
      return;
    }

    // جلب التقييمات من الكولكشن Review
    const reviews = await Review.find({ freelancerId })
      .populate("userId", "fullName profileImage")
      .sort({ createdAt: -1 });

    // حساب عدد الحجوزات المكتملة
    const user = await User.findOne({ firebaseUID: req.user?.uid });
    const completedBookings =
      user?.freelancerProfile?.bookings.filter((b) => b.status === "completed")
        .length || 0;

    // حساب متوسط التقييم
    const avgRating =
      (
        await Review.aggregate([
          { $match: { freelancerId: freelancer._id } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ])
      )[0]?.avg || 0;

    // منح شارة "trusted" إن توفرت الشروط
    if (
      completedBookings >= 10 &&
      avgRating >= 4.5 &&
      freelancer.freelancerProfile?.badges &&
      !freelancer.freelancerProfile.badges.includes("trusted")
    ) {
      freelancer.freelancerProfile.badges.push("trusted");
      await freelancer.save();
    }

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم", error: err });
  }
};

export const flagReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: "المراجعة غير موجودة" });
      return;
    }

    if (review.flagged) {
      res.status(400).json({ message: "تم الإبلاغ عن هذه المراجعة مسبقاً" });
      return;
    }

    review.flagged = true;
    await review.save();

    res.json({ message: "تم الإبلاغ عن المراجعة بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الإبلاغ", error: err });
  }
};
