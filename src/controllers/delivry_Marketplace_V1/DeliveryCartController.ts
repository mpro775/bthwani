// controllers/delivry/DeliveryCartController.ts
import { Request, Response } from "express";
import DeliveryCart from "../../models/delivry_Marketplace_V1/DeliveryCart";
import { User } from "../../models/user";
import geolib from "geolib";
import DeliveryStore from "../../models/delivry_Marketplace_V1/DeliveryStore";
import PricingStrategy from "../../models/delivry_Marketplace_V1/PricingStrategy";
import { calculateDeliveryPrice } from "../../utils/deliveryPricing";

interface CartItemPayload {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}
interface RemoveItemParams {
  cartId?: string;
  userId?: string;
  productId: string;
}
interface SingleItemPayload {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  storeId: string;
  image?: string;
  isCustom?: boolean;
  customPrice?: number;
}

interface MultiItemPayload {
  items: SingleItemPayload[];
  storeId: string;
  cartId?: string;
}

export const addOrUpdateCart = async (req: Request, res: Response) => {
  try {
    // 1) ارفع كل البيانات لهيكل موحّد items[]
    let itemsArr: SingleItemPayload[];
    let storeId: string;
    let cartId: string | undefined;

    // إذا جاء مصفوفة items
    if (Array.isArray((req.body as MultiItemPayload).items)) {
      const body = req.body as MultiItemPayload;
      itemsArr = body.items;
      storeId = body.storeId;
      cartId = body.cartId;
    } else {
      // نمط fields منفصلة
      const {
        productId,
        name,
        price,
        quantity,
        storeId: sId,
        image,
        cartId: cId,
        isCustom,
        customPrice,
      } = req.body as SingleItemPayload & { cartId?: string };
      itemsArr = [
        {
          productId,
          name,
          price,
          quantity,
          storeId: sId,
          image,
          isCustom,
          customPrice,
        },
      ];
      storeId = sId;
      cartId = cId;
    }

    if (itemsArr.length === 0) {
      res.status(400).json({ message: "السلة فارغة" });
      return;
    }

    // 2) حدد الفلتر: cartId أولاً، ثم المستخدم عبر firebaseUID
    const filter: any = {};
    if (cartId) {
      filter.cartId = cartId;
    } else if (req.user?.id) {
      const user = await User.findOne({ firebaseUID: req.user.id }).exec();
      if (!user) {
        res.status(404).json({ message: "المستخدم غير موجود" });
        return;
      }
      filter.userId = user._id;
    } else {
      res.status(400).json({ message: "cartId أو تسجيل الدخول مطلوب" });
      return;
    }

    // 3) جلب السلة الحالية
    let cart = await DeliveryCart.findOne(filter);

    // 4) تأكد ألا يختلط متجر مختلف
    if (cart && cart.store.toString() !== storeId) {
      res.status(400).json({ message: "لا يمكن طلب من متجر مختلف" });
      return;
    }

    // 5) دمج البنود وتحديث total
    if (!cart) {
      // إنشاء سلة جديدة
      const total = itemsArr.reduce(
        (sum, it) =>
          sum + (it.isCustom ? 0 : it.price * it.quantity),
        0
      );
      cart = new DeliveryCart({
        cartId: filter.cartId,
        userId: filter.userId,
        storeId,
        items: itemsArr,
        total,
      });
    } else {
      // تحديث السلة الحالية
      for (const it of itemsArr) {
        const idx = cart.items.findIndex(
          (i) => i.product?.toString() === it.productId
        );
        if (idx > -1) {
          cart.items[idx].quantity += it.quantity;
        } else {
          cart.items.push(it as any);
        }
        if (!it.isCustom) {
          cart.total += it.price * it.quantity;
        }
      }
    }

    await cart.save();
    res.status(201).json({ cart, cartId: cart.id });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};
export const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const firebaseUID = req.user?.id;
    if (!firebaseUID) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const { productId } = req.params;
    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity < 1) {
       res.status(400).json({ message: "Quantity must be ≥ 1" });
       return;
    }

    // إيجاد المستخدم
    const user = await User.findOne({ firebaseUID }).exec();
    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    // إيجاد سلة المستخدم
    const cart = await DeliveryCart.findOne({ userId: user._id });
    if (!cart) {
       res.status(404).json({ message: "Cart not found" });
       return;
    }

    // إيجاد العنصر وتعديله
    const idx = cart.items.findIndex(
      (i) => i.product?.toString() === productId
    );
    if (idx === -1) {
       res.status(404).json({ message: "Item not found in cart" });
       return;
    }

    // ضبط الكمية
    cart.items[idx].quantity = quantity;

    // إعادة حساب الإجمالي
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.isCustom ? 0 : item.price * item.quantity),
      0
    );

    await cart.save();
     res.json(cart);
     return;
  } catch (err: any) {
     res.status(500).json({ message: err.message });
     return;
  }
};
export const getCart = async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    let filter: any = {};

    if (cartId) {
      filter.cartId = cartId;
    } else if (req.user?.id) {
      const user = await User.findOne({ firebaseUID: req.user.id }).exec();
      if (!user) {
        res.status(404).json({ message: "المستخدم غير موجود" });
        return;
      }
      filter.userId = user._id;
    } else {
      res.status(400).json({ message: "cartId أو تسجيل الدخول مطلوب" });
      return;
    }

    const cart = await DeliveryCart.findOne(filter);
    if (!cart) {
      res.status(404).json({ message: "سلة فارغة" });
      return;
    }

    res.json(cart);
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    let filter: any = {};

    if (req.params.cartId || req.body.cartId) {
      filter.cartId = req.params.cartId || req.body.cartId;
    } else if (req.user?.id) {
      // المستخدم المسجّل
      const user = await User.findOne({ firebaseUID: req.user.id }).exec();
      filter.userId = user!._id;
    } else {
      res.status(400).json({ message: "cartId أو تسجيل الدخول مطلوب" });
      return;
    }

    await DeliveryCart.findOneAndDelete(filter);
    res.json({ message: "تم حذف السلة بنجاح" });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};
export const mergeCart = async (req: Request, res: Response) => {
  const userId = req.user!.id; // تأكدنا من verifyToken
  const guestItems = req.body.items as Array<{
    productId: string;
    quantity: number;
  }>;
  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    res.status(400).json({ message: "لا توجد عناصر للدمج" });
    return;
  }

  // ابني أو حدّث السلة للمستخدم
  const cart = await DeliveryCart.findOneAndUpdate(
    { userId },
    {
      $inc: { total: 0 },
      $setOnInsert: { userId, storeId: req.body.storeId },
      $push: { items: { $each: guestItems } },
    },
    { upsert: true, new: true }
  );

  res.json(cart);
  return;
};

export const getAllCarts = async (_: Request, res: Response) => {
  try {
    const carts = await DeliveryCart.find().sort({ createdAt: -1 });
    res.json(carts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getAbandonedCarts = async (_: Request, res: Response) => {
  try {
    const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);
    const carts = await DeliveryCart.find({
      createdAt: { $lt: THIRTY_MINUTES_AGO },
    }).populate("user", "fullName phone");
    res.json(carts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getDeliveryFee = async (req: Request, res: Response) => {
  try {
    const firebaseUID = req.user.id;
    const { addressId, deliveryMode = "split" } = req.query;

    // تحميل المستخدم والعنوان
    const user = await User.findOne({ firebaseUID });
const address = user.addresses.find(a => a._id.toString() === addressId);
if (!address) {
   res.status(400).json({ message: "عنوان غير صالح" });
   return;
}
    if (!address) {
res.status(400).json({ message: "عنوان غير صالح" });
      return;
    } 

    // جلب محتوى السلة
    const cart = await DeliveryCart.findOne({ userId: user._id });
    if (!cart) {
res.status(400).json({ message: "السلة فارغة" });
      return;
    } 

    // جلب الاستراتيجية
    const strategy = await PricingStrategy.findOne({});
    if (!strategy) throw new Error("Pricing strategy not configured");

    let fee = 0;
    if (deliveryMode === "unified") {
      // استخدم أقرب متجر فقط
      const storeId = cart.items[0].store;
      const store = await DeliveryStore.findById(storeId);
      const distKm =
        geolib.getDistance(
          { latitude: store.location.lat, longitude: store.location.lng },
          { latitude: address.location.lat, longitude: address.location.lng }
        ) / 1000;
      fee = calculateDeliveryPrice(distKm, strategy);
    } else {
      // لكل متجر ضمن السلة
   const grouped = cart.items.reduce((map, i) => {
  const key = i.store.toString();           // ⇐ هنا
  (map[key] = map[key] || []).push(i);
  return map;
}, {} as Record<string, typeof cart.items>);

      for (const storeId of Object.keys(grouped)) {
        const store = await DeliveryStore.findById(storeId);
        const distKm =
          geolib.getDistance(
            { latitude: store.location.lat, longitude: store.location.lng },
            { latitude: address.location.lat, longitude: address.location.lng }
          ) / 1000;
        fee += calculateDeliveryPrice(distKm, strategy);
      }
    }

     res.json({ deliveryFee: fee, cartTotal: cart.total, grandTotal: cart.total + fee });
     return;
  } catch (err) {
     res.status(500).json({ message: err.message });
     return;
  }
};

export const removeItem = async (
  req: Request<RemoveItemParams>,
  res: Response
) => {
  const { cartId, userId, productId } = {
    ...req.params,
    ...(req.params.userId && { userId: req.params.userId }),
  };
  const filter: any = userId ? { userId } : { cartId };
  const cart = await DeliveryCart.findOne(filter);
  if (!cart) {
    res.status(404).json({ message: "سلة غير موجودة" });
    return;
  }
  cart.items = cart.items.filter((i) => i.product?.toString() !== productId);
  cart.total = cart.items.reduce(
    (sum, i) => sum + (i.isCustom ? 0 : i.price * i.quantity),
    0
  );
  await cart.save();
  res.json(cart);
};
