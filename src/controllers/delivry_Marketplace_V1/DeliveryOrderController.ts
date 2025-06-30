import { Request, Response } from "express";
import DeliveryOrder, { OrderStatus } from "../../models/delivry_Marketplace_V1/Order";
import DeliveryCart from "../../models/delivry_Marketplace_V1/DeliveryCart";
import { User } from "../../models/user";
import mongoose from "mongoose";
import { io } from "../..";
import DeliveryStore from "../../models/delivry_Marketplace_V1/DeliveryStore";
import Driver from "../../models/Driver_app/driver";
import { calculateDeliveryPrice } from "../../utils/deliveryPricing";
import geolib from "geolib";
import PricingStrategy from "../../models/delivry_Marketplace_V1/PricingStrategy";

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. تحقق من المستخدم
    const firebaseUID = req.user?.id;
    if (!firebaseUID) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await User.findOne({ firebaseUID }).session(session);
    if (!user) throw new Error("المستخدم غير موجود");

    // 2. جلب سلة المشتريات
    const cart = await DeliveryCart.findOne({ userId: user._id }).session(
      session
    );
    if (!cart || cart.items.length === 0) throw new Error("السلة فارغة");

    // 3. بيانات الطلب الواردة
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

    // 4. اختر العنوان (من body أو الافتراضي)
    const targetId = addressId || user.defaultAddressId?.toString();
    const chosenAddress = user.addresses.find(
      (a) => a._id.toString() === targetId
    );
    if (!chosenAddress || !chosenAddress.location)
      throw new Error("العنوان غير صالح");

    // 5. تحقق من رصيد المحفظة إذا كان الدفع Wallet
   
    // 6. تجميع العناصر بحسب المتجر
    const grouped: Record<string, typeof cart.items> = {};
    for (const item of cart.items) {
      const key = item.store.toString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }

    // 7. جلب استراتيجية التسعير (شرائح + سعر افتراضي)
    const strategy = await PricingStrategy.findOne({}).session(session);
    if (!strategy) throw new Error("استراتيجية التسعير غير مكوَّنة");

    // 8. حساب رسوم التوصيل
    let deliveryFee = 0;
    const stores = Object.keys(grouped);
    if (deliveryMode === "unified") {
      // استخدم أول متجر فقط
      const s = await DeliveryStore.findById(stores[0]).session(session);
      if (!s) throw new Error("المتجر غير موجود");
      const distKm =
        geolib.getDistance(
          { latitude: s.location.lat, longitude: s.location.lng },
          {
            latitude: chosenAddress.location.lat,
            longitude: chosenAddress.location.lng,
          }
        ) / 1000;
      deliveryFee = calculateDeliveryPrice(distKm, strategy);
    } else {
      // لكل متجر ضمن السلة
      for (const storeId of stores) {
        const s = await DeliveryStore.findById(storeId).session(session);
        if (!s) throw new Error(`المتجر ${storeId} غير موجود`);
        const distKm =
          geolib.getDistance(
            { latitude: s.location.lat, longitude: s.location.lng },
            {
              latitude: chosenAddress.location.lat,
              longitude: chosenAddress.location.lng,
            }
          ) / 1000;
        deliveryFee += calculateDeliveryPrice(distKm, strategy);
      }
    }

    

    // 9. إعداد subOrders واختيار السائق
    let commonDriver = null;
    if (deliveryMode === "unified") {
      const origin = await DeliveryStore.findById(stores[0]).session(session);
      if (origin) {
        commonDriver = await mongoose
          .model("Driver")
          .findOne({
            status: "active",
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [origin.location.lng, origin.location.lat],
                },
                $maxDistance: 5000,
              },
            },
          })
          .session(session);
      }
    }

    const subOrders = await Promise.all(
      stores.map(async (storeId) => {
        const items = grouped[storeId];
        let driver = commonDriver;
        if (!driver) {
          const s = await DeliveryStore.findById(storeId).session(session)!;
          driver = await mongoose
            .model("Driver")
            .findOne({
              status: "active",
              location: {
                $near: {
                  $geometry: {
                    type: "Point",
                    coordinates: [s.location.lng, s.location.lat],
                  },
                  $maxDistance: 5000,
                },
              },
            })
            .session(session);
        }
        return {
          store: storeId,
          items: items.map((i) => ({
            product: i.product,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          driver: driver?._id || null,
          status: "pending_confirmation" as const,
        };
      })
    );
    // 10. حساب المشاركة حسب كل متجر
    // 10. حساب companyShare و platformShare
    let totalCompanyShare = 0;
    let totalPlatformShare = 0;
    for (const so of subOrders) {
      const s = await DeliveryStore.findById(so.store).session(session);
      if (!s) continue;
      const subTotal = so.items.reduce(
        (sum, it) => sum + it.quantity * it.unitPrice,
        0
      );
      const rate = s.takeCommission ? s.commissionRate : 0;
      const companyShare = subTotal * rate;
      totalCompanyShare += companyShare;
      totalPlatformShare += subTotal - companyShare;
    }

    // 11. المبلغ النهائي
const totalPrice = cart.total + deliveryFee;

// احسب الدفع من المحفظة وباقي الكاش
const walletUsed = Math.min(user.wallet.balance, totalPrice);
const cashDue    = totalPrice - walletUsed;

// خصم الرصيد
if (walletUsed > 0) {
  user.wallet.balance -= walletUsed;
  await user.save({ session });
}

    // 12. خصم من المحفظة
    if (paymentMethod === "wallet") {
      user.wallet.balance -= totalPrice;
      await user.save({ session });
    }

    // 13. إنشاء الطلب
    const order = new DeliveryOrder({
      user: user._id,
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
      deliveryFee,
      price: totalPrice,
      companyShare: totalCompanyShare,
      platformShare: totalPlatformShare,
      notes,
        walletUsed,

        cashDue,

  paymentMethod: cashDue > 0 ? "mixed" : "wallet",
      status: "pending_confirmation",
  paid: paymentMethod === "wallet" || cashDue === 0,
    });

    await order.save({ session });
    await DeliveryCart.deleteOne({ _id: cart._id }).session(session);
    await session.commitTransaction();

    // 14. إشعار العميل
    const notif = {
      title: `طلبك #${order._id} تم إنشاؤه`,
      body: `المبلغ: ${order.price} ريال. في انتظار تأكيد الإدارة.`,
      data: { orderId: order._id.toString() },
      isRead: false,
      createdAt: new Date(),
    };
    await User.findByIdAndUpdate(user._id, {
      $push: { notificationsFeed: notif },
    });
    io.to(`user_${user._id.toString()}`).emit("notification", notif);

    res.status(201).json(order);
    return;
  } catch (err: any) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
    return;
  } finally {
    session.endSession();
  }
};
// PUT /orders/:id/vendor-accept
export const vendorAcceptOrder = async (req: Request, res: Response) => {
  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  // نقبل الطلب فقط إذا هو في الانتظار أو قيد المراجعة
  if (!["pending_confirmation", "under_review"].includes(order.status)) {
    res.status(400).json({ message: "Cannot accept in current status" });
    return;
  }

  // العثور على المتجر من أول subOrder
  const store = await DeliveryStore.findById(order.subOrders[0].store);
  if (!store) {
    res.status(404).json({ message: "Store not found" });
    return;
  }

  // اختيار أقرب سائق
  const driver = await Driver.findOne({
    isAvailable: true,
    isBanned: false,
    $or: [
      { isJoker: false },
      {
        isJoker: true,
        jokerFrom: { $lte: new Date() },
        jokerTo: { $gte: new Date() },
      },
    ],
    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [store.location.lng, store.location.lat],
        },
        $maxDistance: 5000,
      },
    },
  });
  if (!driver) {
    res.status(400).json({ message: "No available driver nearby" });
    return;
  }

  // عيّن السائق وحوّل الحالة إلى "preparing"
  // تسجيل التاريخ وتحويل الحالة
  order.status = "preparing";
  order.statusHistory.push({
    status:    "preparing",
    changedAt: new Date(),
    changedBy: "store",
  });

  // إذا تُريد تسجيل وقت التعيين:
  order.assignedAt = new Date();
    await order.save();

  res.json(order);
  return;
};
// PATCH /orders/:id/admin-status
export const adminChangeStatus = async (req: Request, res: Response) => {
  const { status, reason, returnBy } = req.body;
  const validStatuses = [
    "pending_confirmation",
    "under_review",
    "preparing",
    "out_for_delivery",
    "delivered",
    "returned",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "حالة غير صحيحة" });
    return;
  }

  const update: any = { status };
  // إذا كانت حالة إرجاع أو إلغاء، خزّن السبب
  if (status === "returned" || status === "cancelled") {
    update.returnReason = reason || "بدون تحديد";
    update.returnBy = returnBy || "admin"; // مثلاً "admin" أو "store" أو "driver" أو "customer"
  } else {
    // إزالة حقول الإرجاع إذا جرى تغيير إلى حالة أخرى
    update.returnReason = undefined;
    update.returnBy = undefined;
  }

  const order = await DeliveryOrder.findById(req.params.id);
  if (!order) {
res.status(404).json({ message: "Order not found" });
    return;
  } 

  // تسجيل التاريخ
  order.status = status as OrderStatus;
  order.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: "admin",
  });

  // إدارة سبب الإرجاع/الإلغاء
  if (status === "returned" || status === "cancelled") {
    order.returnReason = reason || "بدون تحديد";
    order.returnBy     = returnBy || "admin";
  } else {
    order.returnReason = undefined;
    order.returnBy     = undefined;
  }

  await order.save();
   res.json(order);
   return;
};
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const firebaseUID = req.user?.id;
    if (!firebaseUID) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const orderId = req.params.id;
    const user = await User.findOne({ firebaseUID }).exec();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // نجد الطلب ونتحقق من ملكيته
    const order = await DeliveryOrder.findOne({
      _id: orderId,
      userId: user._id,
    });
    if (!order) {
      res.status(404).json({ message: "Order not found or not yours" });
      return;
    }

    // يمكن الإلغاء فقط في الحالات المسموح بها
    if (!["pending_confirmation"].includes(order.status)) {
      res.status(400).json({ message: "Cannot cancel at this stage" });
      return;
    }

    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      changedAt: new Date(),
      changedBy: "customer",
    });
    await order.save();

    // (اختياري) إذا دفع بالـ wallet، أرجع المبلغ:
    // if (order.paid && order.paymentMethod === "wallet") { ... }

    res.json({ message: "Order cancelled", order });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
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
// POST /orders/:id/repeat
export const repeatOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. التحقق من هوية المستخدم
    const firebaseUID = req.user?.id;
    if (!firebaseUID) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await User.findOne({ firebaseUID }).session(session);
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    // 2. جلب الطلب القديم والتأكد من ملكية المستخدم
    const oldOrder = await DeliveryOrder.findById(req.params.id).session(
      session
    );
    if (!oldOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    if (!oldOrder.user.equals(user._id)) {
      res.status(403).json({ message: "Not your order" });
      return;
    }

    // 3. جلب استراتيجية التسعير
    const strategy = await PricingStrategy.findOne().session(session);
    if (!strategy) {
      throw new Error("استراتيجية التسعير غير مكوَّنة");
    }

    // 4. إعادة بناء subOrders بدون سائق وحالة أولية
    const subOrdersData = oldOrder.subOrders.map((so) => ({
      store: so.store,
      items: so.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      driver: null,
      status: "pending_confirmation" as const,
    }));

    // 5. حساب رسوم التوصيل مرة أخرى بناءً على العنوان القديم
    let deliveryFee = 0;
    for (const so of subOrdersData) {
      const store = await DeliveryStore.findById(so.store).session(session);
      if (!store) continue;
      const distKm =
        geolib.getDistance(
          { latitude: store.location.lat, longitude: store.location.lng },
          {
            latitude: oldOrder.address.location.lat,
            longitude: oldOrder.address.location.lng,
          }
        ) / 1000;
      deliveryFee += calculateDeliveryPrice(distKm, strategy);
    }

    // 6. حساب companyShare و platformShare بناءً على الأسعار القديمة
    let totalCompanyShare = 0;
    let totalPlatformShare = 0;
    for (const so of subOrdersData) {
      const store = await DeliveryStore.findById(so.store).session(session);
      if (!store) continue;
      const subTotal = so.items.reduce(
        (sum, it) => sum + it.quantity * it.unitPrice,
        0
      );
      const rate = store.takeCommission ? store.commissionRate : 0;
      const companyShare = subTotal * rate;
      totalCompanyShare += companyShare;
      totalPlatformShare += subTotal - companyShare;
    }

    // 7. التجهيز للنشر (سعر السلع + الرسوم)
    const cartTotal = oldOrder.subOrders
      .flatMap((so) => so.items)
      .reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const totalPrice = cartTotal + deliveryFee;

    // 8. إعداد الطلب الجديد
    const newOrder = new DeliveryOrder({
      user: user._id,
      deliveryMode: oldOrder.deliveryMode,
      scheduledFor: req.body.scheduledFor || null,
      address: oldOrder.address,
      subOrders: subOrdersData,
      deliveryFee,
      price: totalPrice,
      companyShare: totalCompanyShare,
      platformShare: totalPlatformShare,
      notes: oldOrder.notes,
      paymentMethod: oldOrder.paymentMethod,
      status: "pending_confirmation",
      paid: false,
    });

    // 9. حفظ الطلب
    await newOrder.save({ session });
    await session.commitTransaction();

    res.status(201).json(newOrder);
    return;
  } catch (err: any) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
    return;
  } finally {
    session.endSession();
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

    const order = await DeliveryOrder.findById(id);
    if (order) {
      order.status = status as any;
      order.statusHistory.push({
        status,
        changedAt: new Date(),
        changedBy: (req.user as any)?.role || "admin",
      });
      await order.save();
    }

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
      order.user, // ObjectId هنا
      { $push: { notificationsFeed: notif } }
    );

    // إرسال لحظياً لغرفة المستخدم التي أسميتَها user_<uid>
    io.to(`user_${order.user.toString()}`).emit("notification", notif);

    res.json(order);
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};
