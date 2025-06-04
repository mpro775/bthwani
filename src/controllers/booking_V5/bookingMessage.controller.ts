import { Request, Response } from "express";
import BookingMessage from "../../models/booking_V5/booking.model";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId;
    const senderId = req.user?.id;
    const { text } = req.body;

    const msg = await BookingMessage.create({ bookingId, senderId, text });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: "فشل إرسال الرسالة", error: err });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId;

    const messages = await BookingMessage.find({ bookingId })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName profileImage");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "فشل تحميل الرسائل", error: err });
  }
};
