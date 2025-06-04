import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Driver } from "../../models/Driver_app/driver";
import { DeliveryOrder } from "../../models/Driver_app/deliveryOrder.model";
import { DriverReview } from "../../models/Driver_app/driverReview.model";
import { User } from "../../models/user";
import { OTP } from "../../models/otp";
import { generateOTP } from "../../utils/otp";
import { sendWhatsAppMessage } from "../../utils/whatsapp";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// تسجيل الدخول
export const loginDriver = async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const driver = await Driver.findOne({ phone });

  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  const isMatch = await bcrypt.compare(password, driver.password);
  if (!isMatch) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ id: driver._id, role: driver.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, driver });
};

// تغيير كلمة المرور
export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const driver = await Driver.findById(req.user.id);

  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  const isMatch = await bcrypt.compare(oldPassword, driver.password);
  if (!isMatch) {
    res.status(400).json({ message: "Incorrect old password" });
    return;
  }

  driver.password = await bcrypt.hash(newPassword, 10);
  await driver.save();

  res.json({ message: "Password updated successfully" });
};

export const updateLocation = async (req: Request, res: Response) => {
  const { lat, lng } = req.body;
  const driver = await Driver.findByIdAndUpdate(
    req.user.id,
    {
      currentLocation: {
        lat,
        lng,
        updatedAt: new Date(),
      },
    },
    { new: true }
  );
  res.json(driver);
};

export const updateAvailability = async (req: Request, res: Response) => {
  const { isAvailable } = req.body;
  const driver = await Driver.findByIdAndUpdate(
    req.user.id,
    { isAvailable },
    { new: true }
  );
  res.json(driver);
};

export const getMyProfile = async (req: Request, res: Response) => {
  const driver = await Driver.findById(req.user.id).select("-password");
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }
  res.json(driver);
};

export const updateMyProfile = async (req: Request, res: Response) => {
  const allowedFields = [
    "fullName",
    "email",
    "vehicleType",
    "residenceLocation",
  ];
  const updates: any = {};

  for (const field of allowedFields) {
    if (req.body[field]) updates[field] = req.body[field];
  }

  const driver = await Driver.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  }).select("-password");
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }
  res.json(driver);
};

export const addOtherLocation = async (req: Request, res: Response) => {
  const { label, lat, lng } = req.body;
  const driver = await Driver.findById(req.user.id);
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  driver.otherLocations.push({ label, lat, lng, updatedAt: new Date() });
  await driver.save();

  res.json(driver.otherLocations);
};
export const deleteOtherLocation = async (req: Request, res: Response) => {
  const index = parseInt(req.params.index);
  const driver = await Driver.findById(req.user.id);
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  if (index < 0 || index >= driver.otherLocations.length) {
    res.status(400).json({ message: "Invalid location index" });
    return;
  }

  driver.otherLocations.splice(index, 1);
  await driver.save();

  res.json(driver.otherLocations);
};

export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await DeliveryOrder.find({ driverId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

export const completeOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await DeliveryOrder.findOne({
    _id: orderId,
    driverId: req.user.id,
  });
  if (!order) {
    res.status(404).json({ message: "Order not found or not assigned to you" });
    return;
  }

  order.status = "delivered";
  order.deliveredAt = new Date();
  await order.save();

  // يمكنك هنا إضافة تحديث المحفظة إن أردت

  res.json({ message: "Order marked as delivered", order });
};

export const addReviewForUser = async (req: Request, res: Response) => {
  const { orderId, userId, rating, comment } = req.body;

  const existing = await DriverReview.findOne({
    orderId,
    driverId: req.user.id,
  });
  if (existing) {
    res.status(400).json({ message: "You have already reviewed this order." });
    return;
  }

  const review = await DriverReview.create({
    orderId,
    driverId: req.user.id,
    userId,
    rating,
    comment,
  });

  res.status(201).json(review);
};

export const initiateTransferToUser = async (req: Request, res: Response) => {
  const { amount, transferToPhone, transferToName } = req.body;

  const driver = await Driver.findById(req.user.id);
  if (driver.wallet.balance < amount) {
    res.status(400).json({ message: "Insufficient balance" });
    return;
  }

  const user = await User.findOne({
    phone: transferToPhone,
    fullName: transferToName,
  });
  if (!user) {
    res.status(404).json({ message: "No matching user found" });
    return;
  }
  if (!amount || amount <= 0) {
    res.status(400).json({ message: "Invalid amount" });
    return;
  }

  const otpCode = generateOTP(); // e.g., returns '438201'
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.create({
    userId: req.user.id,
    purpose: "driver_wallet_transfer",
    code: otpCode,
    expiresAt,
    metadata: { amount, userId: user._id },
  });
  await OTP.deleteMany({
    userId: req.user.id,
    purpose: "driver_wallet_transfer",
    used: false,
  });

  try {
    await sendWhatsAppMessage(
      driver.phone,
      `📲 رمز تحويل الرصيد هو: *${otpCode}*...`
    );
  } catch (err) {
    console.error("WhatsApp Error", err);
  }
  res.json({ message: "Verification code sent to your phone" });
};

export const confirmTransferToUser = async (req: Request, res: Response) => {
  const { code } = req.body;

  const otp = await OTP.findOne({
    userId: req.user.id,
    code,
    purpose: "driver_wallet_transfer",
    expiresAt: { $gt: new Date() },
    used: false,
  });

  if (!otp) {
    res.status(400).json({ message: "Invalid or expired code" });
    return;
  }

  const driver = await Driver.findById(req.user.id);
  const user = await User.findById(otp.metadata.userId);

  const amount = otp.metadata.amount;
  if (driver.wallet.balance < amount) {
    res.status(400).json({ message: "Insufficient balance" });
    return;
  }

  driver.wallet.balance -= amount;
  user.wallet.balance += amount;

  await driver.save();
  await user.save();

  otp.used = true;
  await otp.save();

  res.json({ message: "Transfer successful", amount, target: user.phone });
};
