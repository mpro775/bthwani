import { Request, Response } from "express";
import DeliveryOrder from "../../models/delivry/Order";
import DeliveryCart from "../../models/delivry/DeliveryCart";
import { User } from "../../models/user";
import mongoose from "mongoose";
import { io } from "../..";

export const createOrder = async (req: Request, res: Response) => {
    console.log('⚙️ Enter createOrder');
  console.log('🔑 req.user.id =', req.user?.id);
  if (!req.user?.id) {
 res.status(401).json({ message: "Unauthorized" });

    return;
  }
    const session = await mongoose.startSession();



  session.startTransaction();
  try {
    // 1) حدد المستخدم عبر firebaseUID
    const firebaseUID = req.user.id as string;
        console.log('🔍 Looking up user by firebaseUID=', firebaseUID);

const user = await User.findOne({ firebaseUID }).session(session);
    console.log('👤 Found user =', user?._id);

if (!user) {
        console.log('❌ User not found');

  await session.abortTransaction();
   res.status(404).json({ message: "المستخدم غير موجود" });
   return;
}
const userId = user._id;
    console.log('🛒 Fetching cart for userId=', userId);

const cart = await DeliveryCart.findOne({ userId }).session(session);
    console.log('🛒 Cart =', cart);

if (!cart || cart.items.length === 0) {
        console.log('❌ Cart empty or missing');

  await session.abortTransaction();
   res.status(400).json({ message: "السلة فارغة أو غير موجودة" });
   return;
}
    // 2) تحقق من العنوان كما قبل
    const { addressId, notes, paymentMethod } = req.body;
        console.log('📦 Payload addressId, notes, paymentMethod =', addressId, notes, paymentMethod);

    const defaultAddressId = (user as any).defaultAddressId as string | undefined;
    const targetId = addressId || defaultAddressId;
    if (!targetId) throw new Error("يرجى اختيار عنوان صالح");

    const chosenAddress = user.addresses.find(a =>
      a._id != null && a._id.toString() === targetId
    );
    if (!chosenAddress || !chosenAddress.location) {
      throw new Error("العنوان المختار غير صالح أو يفتقد الإحداثيات");
    }

    // 3) جلب السلة
 
    // 4) معالجة الدفع
    let paid = false;
    if (paymentMethod === 'wallet') {
      if (user.wallet.balance < cart.total) {
        await session.abortTransaction();
         res.status(402).json({ message: "رصيد المحفظة غير كافٍ" });
         return;
      }
      user.wallet.balance -= cart.total;
      await user.save({ session });
      paid = true;
    }

    // 5) تكوين الطلب
    const order = new DeliveryOrder({
      userId,
      storeId: cart.storeId,
      address: {
        label:   chosenAddress.label,
        street:  chosenAddress.street,
        city:    chosenAddress.city,
        location:{
          lat: chosenAddress.location.lat,
          lng: chosenAddress.location.lng
        }
      },
      items: cart.items.map(i => ({
        productId: i.productId,
        name:      i.name,
        quantity:  i.quantity,
        unitPrice: i.price
      })),
      price:         cart.total,
      notes,
      status:        paid ? 'assigned' : 'pending',
      paymentMethod,
      paid,
    });

    await order.save({ session });
    await DeliveryCart.deleteOne({ _id: cart._id }).session(session);
    await session.commitTransaction();

    // إشعارات كما قبلاً...
    const notif = {
      title:     `تم إنشاء طلبك #${order._id}`,
      body:      `المبلغ: ${order.price} ريال، سيتم التعامل مع طلبك قريباً.`,
      data:      { orderId: order.id.toString() },
      isRead:    false,
      createdAt: new Date(),
    };
    await User.findByIdAndUpdate(userId, { $push: { notificationsFeed: notif } });
    io.to(`user_${userId.toString()}`).emit('notification', notif);

     res.status(201).json(order);
     return;
  } catch (error: any) {
    await session.abortTransaction();
     res.status(500).json({ message: error.message });
     return;
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
    const allowed = ['pending','assigned','delivering','delivered','cancelled'];

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

    const statusMap: Record<string,string> = {
  assigned:  'تم قبول طلبك وتسليمه للسائق',
  delivering:'طلبك قيد التوصيل',
  delivered: 'تم تسليم الطلب بنجاح',
  cancelled: 'تم إلغاء طلبك'
};

const notif = {
  title:    `حالة الطلب #${order._id}`,
  body:     statusMap[order.status] || `حالة: ${order.status}`,
  data:     { orderId: order._id },
  isRead:   false,
  createdAt:new Date()
};

// جلب الـuser نفسه من الـorder.userId
await User.findByIdAndUpdate(
  order.userId,           // ObjectId هنا
  { $push: { notificationsFeed: notif } }
);

// إرسال لحظياً لغرفة المستخدم التي أسميتَها user_<uid>
io.to(`user_${order.userId.toString()}`).emit('notification', notif);


     res.json(order);
     return;
  } catch (error: any) {
     res.status(500).json({ message: error.message });
     return;
  }
};
