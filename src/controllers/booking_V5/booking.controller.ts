import { Request, Response } from "express";
import Booking, {
  BookingDocument,
} from "../../models/booking_V5/booking.model";
import { sendPushNotification } from "../../utils/push";
import { User, UserDocument } from "../../models/user"; // تأكد من الاستيراد
import { AdminLog } from "../../models/admin/adminLog.model";
import { WithdrawalRequest } from "../../models/Wallet_V8/WithdrawalRequest";

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
