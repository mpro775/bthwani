import { Request, Response } from "express";
import DeliveryOrder from "../../models/delivry_Marketplace_V1/Order";
import DeliveryCart from "../../models/delivry_Marketplace_V1/DeliveryCart";
import { User } from "../../models/user";
import mongoose from "mongoose";
import { io } from "../..";
import { Driver } from "../../models/Driver_app/driver";
import DeliveryStore from "../../models/delivry_Marketplace_V1/DeliveryStore";

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const firebaseUID = req.user?.id;
    if (!firebaseUID) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ firebaseUID }).session(session);
    if (!user) throw new Error("المستخدم غير موجود");

    const cart = await DeliveryCart.findOne({ userId: user._id }).session(
      session
    );
    if (!cart || cart.items.length === 0) throw new Error("السلة فارغة");

    const {
      scheduledFor,
      addressId,
      notes,
      paymentMethod,
      deliveryMode = "split",
    } = req.body;

    if (scheduledFor && new Date(scheduledFor) <= new Date()) {
      throw new Error("الوقت المجدوَل يجب أن يكون في المستقبل.");
    }

    const targetId = addressId || user.defaultAddressId;
    const chosenAddress = user.addresses.find(
      (a) => a._id?.toString() === targetId
    );
    if (!chosenAddress || !chosenAddress.location)
      throw new Error("العنوان غير صالح");

    if (paymentMethod === "wallet" && user.wallet.balance < cart.total) {
      throw new Error("رصيد المحفظة غير كافٍ");
    }

    // تجميع العناصر حسب المتجر
    const groupedByStore = {};
    for (const item of cart.items) {
      const key = item.storeId.toString();
      if (!groupedByStore[key]) groupedByStore[key] = [];
      groupedByStore[key].push(item);
    }

    // اختيار مندوب لكل متجر (أو مشترك إذا unified)
    const assignDriver = async (storeId) => {
      const store = await DeliveryStore.findById(storeId);
      return await Driver.findOne({
        status: "active",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [store.location.lng, store.location.lat],
            },
            $maxDistance: 5000,
          },
        },
      });
    };

    let commonDriver = null;
    if (deliveryMode === "unified") {
      const allStoreIds = Object.keys(groupedByStore);
      const firstStore = await DeliveryStore.findById(allStoreIds[0]);
      commonDriver = await Driver.findOne({
        status: "active",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [firstStore.location.lng, firstStore.location.lat],
            },
            $maxDistance: 5000,
          },
        },
      });
    }

    const subOrders = await Promise.all(
      Object.entries(groupedByStore).map(async ([storeId, items]) => {
        const driver =
          deliveryMode === "unified"
            ? commonDriver
            : await assignDriver(storeId);
        return {
          storeId,
          items: (items as any[]).map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
          deliveryDriverId: driver?._id || null,
        };
      })
    );

    // احتساب السعر الإجمالي وتوصيل
    const deliveryFee = deliveryMode === "unified" ? 15 : subOrders.length * 10;
    const totalPrice = cart.total + deliveryFee;

    // إنقاص المحفظة
    if (paymentMethod === "wallet") {
      user.wallet.balance -= totalPrice;
      await user.save({ session });
    }

    const order = new DeliveryOrder({
      userId: user._id,
      deliveryMode,
      scheduledFor: scheduledFor || null,
      address: {
        label: chosenAddress.label,
        street: chosenAddress.street,
        city: chosenAddress.city,
        location: {
          lat: chosenAddress.location.lat,
          lng: chosenAddress.location.lng,
        },
      },
      subOrders,
      price: totalPrice,
      deliveryFee,
      notes,
      paymentMethod,
      status: paymentMethod === "wallet" ? "assigned" : "pending",
      paid: paymentMethod === "wallet",
    });

    await order.save({ session });
    await DeliveryCart.deleteOne({ _id: cart._id }).session(session);

    await session.commitTransaction();

    // إشعار
    const notif = {
      title: `طلبك #${order._id} تم إنشاؤه`,
      body: `المبلغ: ${order.price} ريال. سيتم التعامل مع طلبك قريباً.`,
      data: { orderId: order._id.toString() },
      isRead: false,
      createdAt: new Date(),
    };

    await User.findByIdAndUpdate(user._id, {
      $push: { notificationsFeed: notif },
    });
    io.to(`user_${user._id.toString()}`).emit("notification", notif);

    res.status(201).json(order);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await DeliveryOrder.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id)
      .populate("userId", "name")
      .populate("storeId", "name")
      .populate("driverId", "name");

    if (!order) {
      res.status(404).json({ message: "الطلب غير موجود" });
      return;
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, city, storeId, driverId } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (storeId) filter.storeId = storeId;
    if (driverId) filter.driverId = driverId;

    const orders = await DeliveryOrder.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .populate("storeId", "name")
      .populate("driverId", "name");

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// تحديث الحالة - مخصص للسائق أو الأدمن فقط
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = [
      "pending",
      "assigned",
      "delivering",
      "delivered",
      "cancelled",
    ];

    if (!allowed.includes(status)) {
      res.status(400).json({ message: "حالة غير صحيحة" });
      return;
    }

    const order = await DeliveryOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: "الطلب غير موجود" });
      return;
    }

    const statusMap: Record<string, string> = {
      assigned: "تم قبول طلبك وتسليمه للسائق",
      delivering: "طلبك قيد التوصيل",
      delivered: "تم تسليم الطلب بنجاح",
      cancelled: "تم إلغاء طلبك",
    };

    const notif = {
      title: `حالة الطلب #${order._id}`,
      body: statusMap[order.status] || `حالة: ${order.status}`,
      data: { orderId: order._id },
      isRead: false,
      createdAt: new Date(),
    };

    // جلب الـuser نفسه من الـorder.userId
    await User.findByIdAndUpdate(
      order.userId, // ObjectId هنا
      { $push: { notificationsFeed: notif } }
    );

    // إرسال لحظياً لغرفة المستخدم التي أسميتَها user_<uid>
    io.to(`user_${order.userId.toString()}`).emit("notification", notif);

    res.json(order);
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};
