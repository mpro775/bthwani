import { Request, Response } from "express";
import { User } from "../../models/user";
import { WaslniBooking } from "../../models/Waslni_V4/waslniBooking.model";
import { WaslniReview } from "../../models/Waslni_V4/waslniReview.model";
import mongoose from "mongoose";
import { sendPushNotification } from "../../utils/notifications";

// 🚶 إنشاء طلب حجز من المستخدم
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { category, fromLocation, toLocation, dateTime, isFemaleDriver, city } = req.body;
    const userId = req.user?.id;

    if (!fromLocation || !toLocation || !dateTime || !city || !category) {
       res.status(400).json({ message: "بيانات ناقصة" });
       return;
    }

    const booking = new WaslniBooking({
      userId,
      category,
      fromLocation,
      toLocation,
      dateTime,
      isFemaleDriver,
      city,
    });

    await booking.save();
    res.status(201).json({ message: "تم إرسال الطلب", booking });
  } catch (err) {
    res.status(500).json({ message: "فشل في إنشاء الحجز", error: err });
  }
};

// 🚗 سائق: قبول الطلب
export const acceptBooking = async (req: Request, res: Response) => {
  try {
    const driverId = req.user?.id;
    const booking = await WaslniBooking.findById(req.params.id);

    const driver = await User.findById(driverId);
if (driver?.isBlacklisted) {
   res.status(403).json({ message: "تم حظر هذا الحساب من تقديم الخدمة" });
   return;
}

    if (!booking || booking.status !== "pending") {
       res.status(400).json({ message: "طلب غير صالح" });
       return;
    }

   const user = await User.findById(booking.userId);
if (user?.pushToken) {
  await sendPushNotification(
    user.pushToken,
    "تم قبول الطلب 🚗",
    "سائقك في طريقه إليك الآن"
  );
}

booking.driverId = new mongoose.Types.ObjectId(driverId);
    booking.status = "accepted";
    await booking.save();

    res.json({ message: "تم قبول الطلب", booking });
  } catch (err) {
    res.status(500).json({ message: "فشل في قبول الطلب", error: err });
  }
};

// 🚗 سائق: بدء الرحلة
export const startRide = async (req: Request, res: Response) => {
  try {
    const booking = await WaslniBooking.findById(req.params.id);
    if (!booking || booking.status !== "accepted") {
       res.status(400).json({ message: "لا يمكن بدء الرحلة" });
       return;
    }
    booking.status = "started";
    await booking.save();
    res.json({ message: "تم بدء الرحلة", booking });
  } catch (err) {
    res.status(500).json({ message: "فشل بدء الرحلة", error: err });
  }
};

// 🚗 سائق: إنهاء الرحلة
export const completeRide = async (req: Request, res: Response) => {
  try {
    const booking = await WaslniBooking.findById(req.params.id);
    if (!booking || booking.status !== "started") {
       res.status(400).json({ message: "لا يمكن إنهاء الرحلة" });
       return;
    }
    booking.status = "completed";
    const user = await User.findById(booking.userId);

    if (user?.pushToken) {
  await sendPushNotification(
    user.pushToken,
    "🚘 تم إنهاء الرحلة",
    "شكراً لاستخدامك وصلني، يُمكنك الآن تقييم السائق"
  );
}

    await booking.save();
    res.json({ message: "تم إنهاء الرحلة", booking });
  } catch (err) {
    res.status(500).json({ message: "فشل في إنهاء الرحلة", error: err });
  }
};

// 🚗 سائق: رفع إثبات توصيل (نقل ثقيل فقط)
export const uploadProof = async (req: Request, res: Response) => {
  try {
    const booking = await WaslniBooking.findById(req.params.id);
    if (!booking || booking.category !== "heavy") {
       res.status(400).json({ message: "الحجز غير صالح" });
       return;
    }

    const image = req.file;
const uploaded = { url: `/uploads/${req.file.filename}` }; // مؤقتًا محليًا
    booking.proofImage = uploaded.url;
    await booking.save();

    res.json({ message: "تم رفع الإثبات", proof: uploaded.url });
  } catch (err) {
    res.status(500).json({ message: "فشل رفع الإثبات", error: err });
  }
};

// 🚶 المستخدم: إلغاء الحجز
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const booking = await WaslniBooking.findById(req.params.id);
    if (!booking || !["pending", "accepted"].includes(booking.status)) {
       res.status(400).json({ message: "لا يمكن الإلغاء" });
       return;
    }
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "تم إلغاء الحجز" });
  } catch (err) {
    res.status(500).json({ message: "فشل الإلغاء", error: err });
  }
};

// 🛠️ الإدمن: عرض جميع الحجوزات أو حسب المدينة أو النوع
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const filters = req.query; // يمكن تمرير city أو category
    const bookings = await WaslniBooking.find(filters).populate("userId driverId");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "فشل تحميل البيانات", error: err });
  }
};

// POST /waslni/:id/review
export const submitReview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const bookingId = req.params.id;
  const { rating, comment } = req.body;

  try {
    const booking = await WaslniBooking.findById(bookingId);

    if (!booking || booking.status !== "completed" || booking.userId.toString() !== userId) {
       res.status(403).json({ message: "لا يمكن التقييم الآن" });
       return;
    }

    // اختياري: تحديث تقييم السائق داخل ملفه الشخصي
    const driver = await User.findById(booking.driverId);
  await WaslniReview.create({
  driverId: booking.driverId,
  userId,
  bookingId,
  rating,
  comment,
});


    res.json({ message: "تم إرسال التقييم" });
  } catch (err) {
    res.status(500).json({ message: "فشل التقييم", error: err });
  }
};


// POST /waslni/:id/sos
export const sendSOS = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;
    const { location } = req.body;

    // ❗ بإمكانك هنا ربطها بـ Firebase أو إشعار Admin
    console.log("🔴 SOS Received", { userId, bookingId, location });

    res.json({ message: "تم إرسال نداء الطوارئ، سيتم التواصل معك" });
  } catch (err) {
    res.status(500).json({ message: "فشل إرسال نداء الطوارئ", error: err });
  }
};

// GET /waslni/my-bookings
export const getMyBookings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role; // "user" أو "driver"

  try {
    const filter = role === "driver" ? { driverId: userId } : { userId };
    const bookings = await WaslniBooking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "فشل في تحميل الحجوزات", error: err });
  }
};
// POST /waslni/:id/confirm-otp
export const confirmOTP = async (req: Request, res: Response) => {
  const { otp } = req.body;
  const booking = await WaslniBooking.findById(req.params.id);

  if (!booking || booking.category !== "heavy") {
     res.status(400).json({ message: "طلب غير صالح" });
     return;
  }

  if (booking.otp !== otp) {
     res.status(403).json({ message: "رمز التأكيد غير صحيح" });
     return;
  }

  booking.status = "completed";
  await booking.save();

  res.json({ message: "تم تأكيد التسليم", booking });
};

// GET /waslni/stats
export const getWaslniStats = async (_req: Request, res: Response) => {
  try {
    const totalBookings = await WaslniBooking.countDocuments();
    const completed = await WaslniBooking.countDocuments({ status: "completed" });
    const avgRating = await WaslniReview.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.json({
      totalBookings,
      completedBookings: completed,
      avgRating: avgRating[0]?.avg?.toFixed(1) || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "فشل الحصول على الإحصائيات", error: err });
  }
};
