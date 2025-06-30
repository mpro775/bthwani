// src/controllers/orderDriver.ts
import { Request, Response } from "express";
import DeliveryOrder from "../../models/delivry_Marketplace_V1/Order";

export const driverAcceptOrder = async (req: Request, res: Response) => {
  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  const driverId = req.user.id;
  if (!order.candidateDrivers || !order.candidateDrivers.some((d) => d.equals(driverId))) {
    res.status(403).json({ message: "Order not assigned to you" });
    return;
  }

  order.driver = driverId;
  order.candidateDrivers = [];
  order.status = "preparing";
  order.assignedAt = new Date();
  order.statusHistory.push({ status: "preparing", changedAt: new Date(), changedBy: "driver" });
  await order.save();
  res.json(order);
  return;
};

// 4. الدليفري يلتقط الطلب → إلى في الطريق إليك
export const driverPickUp = async (req: Request, res: Response) => {
  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) {
res.status(404).json({ message: "Order not found" });
    return;
  } 
    if (order.status !== "preparing")
    {
res.status(400).json({ message: "Cannot pick up at this stage" });
        return;
    } 

order.status = "out_for_delivery";
order.statusHistory.push({ status: "out_for_delivery", changedAt: new Date(), changedBy: "driver" });
await order.save();
   res.json(order);
   return;
};

// 5. الدليفري يؤكد التسليم → إلى تم التوصيل
export const driverDeliver = async (req: Request, res: Response) => {
  const { receiptNumber } = req.body;
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
   res.json(order);
   return;
};
