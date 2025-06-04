import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Driver } from "../../models/Driver_app/driver";
import { DeliveryOrder } from "../../models/Driver_app/deliveryOrder.model";

export const createDriver = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      role,
      vehicleType,
      city,
      governorate,
      isFemaleDriver,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = await Driver.create({
      fullName,
      phone,
      email,
      password: hashedPassword,
      role,
      vehicleType,
      city,
      governorate,
      isFemaleDriver,
    });

    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: "Error creating driver", error });
  }
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

  const order = await DeliveryOrder.findById(orderId);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  order.driverId = driverId;
  order.status = "in_progress";
  order.assignedAt = new Date();

  await order.save();

  res.json({ message: "Driver assigned", order });
};
