import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Order from "../../models/delivry_Marketplace_V1/Order";
import Driver from "../../models/Driver_app/driver";    // ← هذا الاستيراد مطلوب

export const createDriver = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      role,
      vehicleType,
      isFemaleDriver,
      driverType,          // "primary" | "joker"
      // بيانات العنوان ضرورية الآن
      residenceLocation: {
        address,
        governorate,
        city,
        lat,
        lng
      }
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = await Driver.create({
      fullName,
      phone,
      email,
      password: hashedPassword,
      role,
      vehicleType,
      isFemaleDriver,
      driverType,
      // يوثق تلقائيًا لأن الإنشاء من الأدمن
      isVerified: true,
      // ملء residenceLocation من البودي
      residenceLocation: { address, governorate, city, lat, lng }
    });

    res.status(201).json(driver);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating driver", error });
  }
};

// تبديل نوع السائق (primary ↔ joker) مع ضبط نافذة الجوكر
export const setJokerStatus = async (req: Request, res: Response) => {
  const { driverType, jokerFrom, jokerTo } = req.body;
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
     res.status(404).json({ message: "Driver not found" });
     return;
  }

  // عندما يكون joker نعين نافذة، وإلا نحذفها
  driver.driverType = driverType;
  if (driverType === "joker") {
    driver.jokerFrom = new Date(jokerFrom);
    driver.jokerTo   = new Date(jokerTo);
  } else {
    driver.jokerFrom = undefined;
    driver.jokerTo   = undefined;
  }

  await driver.save();
  res.json(driver);
};
export const toggleBan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const driver = await Driver.findById(id);
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  driver.isBanned = !driver.isBanned;
  await driver.save();

  res.json({
    message: `Driver is now ${driver.isBanned ? "banned" : "unbanned"}`,
  });
};
export const verifyDriver = async (req: Request, res: Response) => {
  const { id } = req.params;
  const driver = await Driver.findByIdAndUpdate(
    id,
    { isVerified: true },
    { new: true }
  );
  res.json(driver);
};

export const listDrivers = async (req: Request, res: Response) => {
  const { role, city, isAvailable } = req.query;

  const filter: any = {};
  if (role) filter.role = role;
  if (city) filter.city = city;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

  const drivers = await Driver.find(filter).select("-password");
  res.json(drivers);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const hashed = await bcrypt.hash(newPassword, 10);
  const driver = await Driver.findByIdAndUpdate(id, { password: hashed });

  res.json({ message: "Password reset successfully" });
};

export const updateWallet = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, operation } = req.body; // operation: 'credit' | 'debit'

  const driver = await Driver.findById(id);
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }
  if (!["credit", "debit"].includes(operation)) {
    res.status(400).json({ message: "Invalid operation" });
    return;
  }

  if (!amount || amount <= 0) {
    res.status(400).json({ message: "Invalid amount" });
    return;
  }

  if (!driver.wallet)
    driver.wallet = {
      balance: 0,
      earnings: 0,
      lastUpdated: new Date(),
    };

  driver.wallet.balance += operation === "credit" ? amount : -amount;
  await driver.save();

  res.json({ message: "Wallet updated", balance: driver.wallet.balance });
};

export const assignDriver = async (req: Request, res: Response) => {
  const { driverId, orderId } = req.body;
  const driver = await Driver.findById(driverId);
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  order.driver = driver.id;
  order.status = "preparing";
  order.candidateDrivers = [];
  order.assignedAt = new Date();

  await order.save();

  res.json({ message: "Driver assigned", order });
};
