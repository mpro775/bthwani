import { Request, Response } from "express";
import Booking, {
  BookingDocument,
} from "../../models/booking_V5/booking.model";
import { sendPushNotification } from "../../utils/push";
import { User, UserDocument } from "../../models/user"; // تأكد من الاستيراد
import { AdminLog } from "../../models/admin/adminLog.model";
import { WithdrawalRequest } from "../../models/Wallet_V8/WithdrawalRequest";
import bookingModel from "../../models/booking_V5/booking.model";

export const createBooking = async (req: Request, res: Response) => {
  const { date } = req.body;
  const userId = req.user?.id;
  const serviceId = req.params.id;
  const amount = 1000; // لاحقًا يتم احتسابه حسب نوع الخدمة

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  user.wallet.balance -= amount;
  user.wallet.escrow = (user.wallet.escrow || 0) + amount;
  user.transactions.push({
    amount,
    type: "debit",
    method: "escrow",
    status: "pending",
    description: "حجز مبلغ للخدمة",
    date: new Date(),
  });

  await user.save();

  const existing = await Booking.findOne({
    serviceId,
    date,
    status: { $in: ["pending", "confirmed"] },
  });
  if (existing) {
    res.status(400).json({ message: "هذا الموعد محجوز مسبقًا" });
    return;
  }

  const booking = await Booking.create({ userId, serviceId, date });
  res.status(201).json({ message: "تم الحجز بنجاح", booking });
};
export const updateBookingStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  const booking = (await Booking.findById(bookingId).populate(
    "userId providerId"
  )) as any;
  const user = booking.userId as any;
  const provider = booking.providerId as any;

  if (!booking) {
    res.status(404).json({ message: "الحجز غير موجود" });
    return;
  }

  const amount = booking.amount;
  if (status === "cancelled") {
    const { reason } = req.body;
    booking.cancelReason = reason || "غير محدد";

    const amount = booking.amount;

    await WithdrawalRequest.create({
      userId: user._id,
      amount,
      method: "agent",
      accountInfo: `استرداد حجز ملغي: ${reason}`,
      status: "review",
    });

    user.wallet.escrow -= amount;

    user.transactions.push({
      amount,
      type: "debit",
      method: "withdrawal",
      status: "pending",
      description: `طلب استرداد بعد إلغاء الحجز`,
      date: new Date(),
    });
    await AdminLog.create({
      actorId: req.user?.id,
      action: "طلب استرداد بعد إلغاء حجز",
      details: `الحجز رقم ${bookingId}، السبب: ${reason}`,
    });
    await user.save();
  }

  if (status === "completed") {
    if (user.wallet.escrow < amount){
       res.status(400).json({ error: "الرصيد المعلق غير كافٍ" });

      return;
    }

    // خصم من escrow
    user.wallet.escrow -= amount;

    // إضافة للمزود
    provider.wallet.balance += amount;
    provider.wallet.totalEarned += amount;

    // تحديث المعاملة في سجل المستخدم
    const tx = user.transactions.find(
      (t) =>
        t.amount === amount && t.method === "escrow" && t.status === "pending"
    );
    if (tx) tx.status = "completed";

    // إضافة معاملة للمزود
    provider.transactions.push({
      amount,
      type: "credit",
      method: "escrow",
      status: "completed",
      description: `استلام مقابل خدمة محجوزة`,
      date: new Date(),
    });
  }

  booking.status = status;
  await booking.save();
  await user.save();
  await provider.save();
  sendPushNotification(
    provider._id.toString(),
    "تم تحويل مبلغ الحجز إلى محفظتك."
  );
  await AdminLog.create({
    actorId: req.user?.id,
    action: "تحويل حجز إلى مزود",
    details: `الحجز رقم ${bookingId} بمبلغ ${amount} تم تحويله إلى ${provider.fullName}`,
  });

  sendPushNotification(
    booking.userId.toString(),
    `تم تحديث حالة الحجز إلى ${status}`
  );
  res.json({ message: "تم التحديث", booking });
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("owner");
    if (!booking) {
      res.status(404).json({ message: "الحجز غير موجود" });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    // 1. نبحث عن كل الحجوزات، ونعمل populate لخدمة BookingService
    const bookings = await bookingModel.find()
      .populate({
        path: "serviceId",
        model: "BookingService", // هذا هو اسم الموديل في mongoose.model("BookingService", ...)
        select: "title type location price media availability categories",
      })
      .lean();

    /**
     * 2. نفوِّر كل عنصر في bookings لنُعيد المعلومات بالشكل الذي يتوقعه الواجهة:
     *    - id: _id الخاص بالحجز
     *    - title/type/price/media/... مأخوذة من خدمة BookingService
     *    - availableHours: تحويل availability إلى مصفوفة نصوص مثل ["09:00-10:00", ...]
     *    - governorate: city أو region من موقع الخدمة
     *    - amenities: نستخدم مثلاً الحقل categories كقائمة amenities
     */
    const formatted = bookings.map((b: any) => {
      const svc = b.serviceId || {};
      // استخراج الأوقات المتاحة في مصفوفة نصوص
      const availableHours: string[] =
        Array.isArray(svc.availability)
          ? svc.availability.flatMap((a: any) =>
              Array.isArray(a.slots)
                ? a.slots.map((slot: any) => `${slot.start}-${slot.end}`)
                : []
            )
          : [];

      return {
        id: b._id.toString(),
        title: svc.title || "",
        type: svc.type || "",
        governorate: svc.location?.city || "",
        price: svc.price || 0,
        // إذا كنت تريد إظهار تقييم (rating) من الـ Review، يمكن إضافته لاحقًا
        rating: 0,
        availableHours,
        media: Array.isArray(svc.media) ? svc.media : [],
        amenities: Array.isArray(svc.categories) ? svc.categories : [],
      };
    });

     res.json(formatted);
     return;
  } catch (error: any) {
    console.error("Error in getAllBookings:", error);
     res
      .status(500)
      .json({ message: "خطأ في الخادم أثناء جلب كل الحجوزات", error: error.message });
      return;
  }
};