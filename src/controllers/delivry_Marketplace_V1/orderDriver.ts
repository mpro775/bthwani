// src/controllers/orderDriver.ts
import { Request, Response } from "express";
import DeliveryOrder from "../../models/delivry_Marketplace_V1/Order";
import Driver from "../../models/Driver_app/driver";
import InvoiceBook from "../../models/Driver_app/invoiceBook";
import AgentTransaction from "../../models/Driver_app/agentTransaction";

// 4. الدليفري يلتقط الطلب → إلى في الطريق إليك
export const driverPickUp = async (req: Request, res: Response) => {
  const { invoiceNumber } = req.body;
  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  if (order.status !== "preparing") {
    res.status(400).json({ message: "Cannot pick up at this stage" });
    return;
  }

  const driver = await Driver.findById(order.driver);
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }
  const book = driver.currentBook ? await InvoiceBook.findById(driver.currentBook) : null;
  if (!book || book.status !== "active") {
    res.status(400).json({ message: "No active invoice book" });
    return;
  }
  if (invoiceNumber < book.startNumber || invoiceNumber > book.endNumber) {
    res.status(400).json({ message: "Invoice number out of range" });
    return;
  }
  const exists = await DeliveryOrder.findOne({
    driver: driver._id,
    deliveryReceiptNumber: invoiceNumber,
  });
  if (exists) {
    res.status(400).json({ message: "Invoice already used" });
    return;
  }

  order.deliveryReceiptNumber = invoiceNumber;
  order.status = "out_for_delivery";
  order.statusHistory.push({ status: "out_for_delivery", changedAt: new Date(), changedBy: "driver" });
  await order.save();
  res.json(order);
};

// 5. الدليفري يؤكد التسليم → إلى تم التوصيل
export const driverDeliver = async (req: Request, res: Response) => {
  const { receiptNumber, collectedAmount = 0 } = req.body;
  if (!receiptNumber) {
     res
      .status(400)
      .json({ message: "رقم السند مطلوب لتأكيد التسليم" });
      return;
  }

  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) {
     res.status(404).json({ message: "Order not found" });
     return;
  }
  if (order.status !== "out_for_delivery") {
     res
      .status(400)
      .json({ message: "لا يمكن تأكيد التسليم في هذه الحالة الحالية" });
      return;
  }

  // خزّن رقم السند
  order.deliveryReceiptNumber = receiptNumber;

  // حرّك الحالة لـ delivered مع التسجيل في history
  order.status = "delivered";
  order.statusHistory.push({
    status:    "delivered",
    changedAt: new Date(),
    changedBy: "driver",
  });

  await order.save();

  const driver = await Driver.findById(order.driver);
  if (driver) {
    const orderValue = order.price - order.deliveryFee;
    driver.depositCurrent = (driver.depositCurrent || 0) - orderValue;
    if (collectedAmount > 0) {
      driver.depositCurrent -= collectedAmount;
      if (!driver.wallet) {
        driver.wallet = { balance: 0, earnings: 0, lastUpdated: new Date() } as any;
      }
      driver.wallet.balance += collectedAmount;
    }
    await driver.save();
    await AgentTransaction.create({
      agentId: driver._id,
      orderId: order._id,
      amount: orderValue,
      type: 'deduct',
    });
  }
  res.json(order);
};