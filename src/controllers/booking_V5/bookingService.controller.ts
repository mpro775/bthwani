import { Request, Response } from "express";
import BookingService from "../../models/booking_V5/bookingService.model";
import bookingModel from "../../models/booking_V5/booking.model";
import bookingServiceModel from "../../models/booking_V5/bookingService.model";

export const createService = async (req: Request, res: Response) => {
  try {
    const service = await BookingService.create({
      ...req.body,
      createdBy: req.user?.id,
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الإنشاء", error: err });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { type, city, category } = req.query;

    const query: any = { status: "active" };
    if (type) query.type = type;
    if (city) query["location.city"] = city;
    if (category) query.categories = category;

    const services = await BookingService.find(query);
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "فشل في تحميل الخدمات", error: err });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const bookings = await bookingModel.find({ userId }).populate("serviceId");
  res.json(bookings);
};

export const getServiceBookings = async (req: Request, res: Response) => {
  const serviceId = req.params.id;
  const bookings = await bookingServiceModel
    .find({ serviceId })
    .populate("userId", "fullName profileImage");
  res.json(bookings);
};

export const getServiceById = async (req: Request, res: Response) => {
  const service = await BookingService.findById(req.params.id);
  if (!service) {
    res.status(404).json({ message: "الخدمة غير موجودة" });
    return;
  }
  res.json(service);
};

export const updateService = async (req: Request, res: Response) => {
  const updated = await BookingService.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

export const deleteService = async (req: Request, res: Response) => {
  await BookingService.findByIdAndDelete(req.params.id);
  res.json({ message: "تم حذف الخدمة" });
};

export const getAvailability = async (req: Request, res: Response) => {
  const service = await BookingService.findById(req.params.id);
  if (!service) {
    res.status(404).json({ message: "الخدمة غير موجودة" });
    return;
  }
  res.json(service.availability);
};
