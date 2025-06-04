import { Request, Response } from "express";
import { BloodRequest } from "../../models/blood_V7/bloodRequest.model";
import { User } from "../../models/user";
import { sendPushNotification } from "../../utils/notifications"; // تأكد من تهيئة هذه الخدمة
import mongoose from "mongoose";

export const createBloodRequest = async (req: Request, res: Response) => {
  try {
    const { bloodType, location, notes, urgent } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId || !bloodType || !location?.coordinates) {
      res.status(400).json({ message: "البيانات ناقصة" });
      return;
    }

    const bloodRequest = new BloodRequest({
      requesterId,
      bloodType,
      location,
      notes,
      urgent,
    });

    await bloodRequest.save();

    // إيجاد المتبرعين المطابقين
    const donors = await User.find({
      bloodType,
      isAvailableToDonate: true,
      donationLocation: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: location.coordinates },
          $maxDistance: 7000, // 7 كم مثلاً
        },
      },
    });

    // تحديث الحقل matchedDonors
    bloodRequest.matchedDonors = donors.map((d) => d._id);
    await bloodRequest.save();

    // إرسال إشعار
    donors.forEach((donor) => {
      if (donor.pushToken) {
        sendPushNotification(
          donor.pushToken,
          `🚨 مطلوب دم من فصيلة ${bloodType}`,
          notes || "يرجى الاستجابة إذا كنت قريباً ومتوفراً."
        );
      }
    });

    res.status(201).json({
      message: "تم إنشاء الطلب وإشعار المتبرعين",
      count: donors.length,
      requestId: bloodRequest._id,
    });
  } catch (err) {
    console.error("❌ Error in createBloodRequest:", err);
    res.status(500).json({ message: "خطأ في الخادم", error: err });
  }
};
// controllers/bloodRequestController.ts
export const markDonationComplete = async (req: Request, res: Response) => {
  const { requestId, location } = req.body;
  const donorId = req.user?.id;

  if (!requestId || !donorId || !location) {
    res.status(400).json({ message: "بيانات ناقصة" });
    return;
  }

  try {
    const donor = await User.findById(donorId);
    if (!donor || !donor.isAvailableToDonate) {
      res.status(403).json({ message: "المستخدم غير مؤهل للتبرع" });
      return;
    }

    // التحقق من التطابق
    const request = await BloodRequest.findById(requestId);
    if (
      !request ||
      !request.matchedDonors.some((id) =>
        id.equals(new mongoose.Types.ObjectId(donorId))
      )
    ) {
      res.status(403).json({ message: "لم يتم تطابقك مع هذا الطلب" });
      return;
    }

    // إضافة سجل التبرع
    donor.donationHistory.push({
      requestId,
      location,
      date: new Date(),
    });
    await donor.save();

    // تغيير حالة الطلب
    request.status = "fulfilled";
    await request.save();

    res.json({ message: "تم تسجيل التبرع بنجاح" });
  } catch (err) {
    console.error("❌ Error in markDonationComplete:", err);
    res.status(500).json({ message: "خطأ في الخادم", error: err });
  }
};
export const getAllBloodDonors = async (req: Request, res: Response) => {
  try {
    const { governorate, bloodType } = req.query;

    const filter: any = {
      bloodType: { $ne: null },
      isAvailableToDonate: true,
    };

    if (governorate && governorate !== "الكل") {
      filter.governorate = governorate;
    }

    if (bloodType && bloodType !== "الكل") {
      filter.bloodType = bloodType;
    }

    const donors = await User.find(filter)
      .select("fullName governorate bloodType isAvailableToDonate _id")
      .sort({ createdAt: -1 });

    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch donors", error });
  }
};
