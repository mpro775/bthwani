import { Request, Response } from "express";
import { User } from "../../models/user";
import { Booking } from "../../models/job_V3/booking.model";

export const createBookingRequest = async (req: Request, res: Response) => {
  try {
    const { freelancerId, date } = req.body;
    const userId = req.user?.id;

    if (!userId || !freelancerId || !date) {
      res.status(400).json({ message: "البيانات ناقصة" });
      return;
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || !freelancer.isFreelancer) {
      res.status(404).json({ message: "المستقل غير موجود" });
      return;
    }

    const booking = new Booking({
      freelancerId,
      userId,
      date,
      status: "pending",
    });
    await booking.save();

    // ✍️ أضف الحجز لملف المستقل
    freelancer.freelancerProfile.bookings.push({
      userId,
      date,
      status: "pending",
    });
    await freelancer.save();

    res.status(201).json({ message: "تم إرسال الطلب", booking });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء الحجز", error });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no-show",
  ];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ message: "حالة غير صالحة" });
    return;
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "الحجز غير موجود" });
      return;
    }

    booking.status = status;
    await booking.save();

    // تحديث الحالة داخل ملف المستقل
    const freelancer = await User.findById(booking.freelancerId);
    if (freelancer && freelancer.freelancerProfile?.bookings) {
      const internal = freelancer.freelancerProfile.bookings.find(
        (b) =>
          b.userId.toString() === booking.userId.toString() &&
          b.date.toISOString() === booking.date.toISOString()
      );
      if (internal) internal.status = status;
      await freelancer.save();
    }

    res.json({ message: "تم تحديث حالة الحجز", booking });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء التحديث", error: err });
  }
};
