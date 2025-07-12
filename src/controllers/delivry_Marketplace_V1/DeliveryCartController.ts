// controllers/delivry/DeliveryCartController.ts
import { Request, Response } from "express";
import DeliveryCart from "../../models/delivry_Marketplace_V1/DeliveryCart";
import { User } from "../../models/user";
import geolib from "geolib";
import DeliveryStore from "../../models/delivry_Marketplace_V1/DeliveryStore";
import PricingStrategy from "../../models/delivry_Marketplace_V1/PricingStrategy";
import { calculateDeliveryPrice } from "../../utils/deliveryPricing";
import mongoose from "mongoose";

interface RemoveItemParams {
  cartId?: string;
  userId?: string;
  productId: string;
}

export const addOrUpdateCart = async (req: Request, res: Response) => {
  try {
    console.log("🔴 BODY FULL:", req.body);

    // 1. استخراج البيانات الأساسية بطريقة مرنة
    let storeId = req.body.storeId || req.body.store; // أهم تعديل: قبول store أو storeId
    let itemsArr = req.body.items || [];
    let cartId = req.body.cartId;
    let note = req.body.note; // استخرج الملاحظة

    console.log("Raw values:", { storeId, itemsArr });

    // 2. معالجة حالة الإرسال الفردي
    if (!Array.isArray(itemsArr)) {
      // إذا كانت العناصر غير مصفوفة، نعالجها كنمط فردي
      const {
        productId,
        name,
        price,
        quantity,
        storeId: itemStoreId,
        store: itemStore,
        image,
      } = req.body;

      itemsArr = [
        {
          productId: productId || req.body.product, // قبول product أو productId
          name,
          price,
          quantity,
          storeId: itemStoreId || itemStore || storeId, // الأفضلية للقيمة المحلية
          image,
        },
      ];

      // تحديث storeId الرئيسي إذا لم يكن موجوداً
      if (!storeId) {
        storeId = itemStoreId || itemStore;
      }
    }

    // 3. التحقق من صحة البيانات
    if (!itemsArr || itemsArr.length === 0 || !storeId) {
      res.status(400).json({ message: "storeId و items مطلوبة" });
      return;
    }

    const toObjectId = (v: any) => {
      if (!v) return undefined;
      return typeof v === "string" && mongoose.Types.ObjectId.isValid(v)
        ? new mongoose.Types.ObjectId(v)
        : v;
    };

    // 4. معالجة المستخدم
    let userObjId: mongoose.Types.ObjectId | undefined;
    if (req.user?.id) {
      const userDoc = await User.findOne({ firebaseUID: req.user.id }).exec();
      if (!userDoc) {
        res.status(404).json({ message: "المستخدم غير موجود" });
        return;
      }
      userObjId = userDoc._id;
    }

    // 5. تحويل المعرفات بشكل صحيح
    const storeObjId = toObjectId(storeId);
    const itemsMapped = itemsArr.map((it) => ({
      product: toObjectId(it.productId || it.product),
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      store: toObjectId(it.storeId || it.store),
      image: it.image,

    }));

    // 6. البحث عن السلة الحالية
    const filter: any = {};
    if (cartId) filter.cartId = cartId;
    if (userObjId) filter.user = userObjId;

    console.log("🟢 سيتم حفظ الكارت بالقيم التالية:");
    console.log("user:", userObjId);
    console.log("store:", storeObjId);
    console.log("items:", itemsMapped);

    let cart = await DeliveryCart.findOne(filter);

    // 7. التحقق من توافق المتجر
    // إذا كان لدينا سلة موجودة ولكنها من متجر مختلف
    if (cart && cart.store.toString() !== storeObjId.toString()) {
      res.status(400).json({ message: "لا يمكن طلب من متجر مختلف" });
      return;
    }

    // 8. إنشاء أو تحديث السلة
    if (!cart) {
      const total = itemsMapped.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );
      cart = new DeliveryCart({
        cartId: cartId || new mongoose.Types.ObjectId().toString(),
        user: userObjId,
        store: storeObjId,
        items: itemsMapped,
        total,
                note, // <-- حفظ الملاحظة مع السلة

      });
    } else {
      // تحديث السلة الحالية
      for (const newItem of itemsMapped) {
        const existingItemIndex = cart.items.findIndex(
          (item) => item.product.toString() === newItem.product.toString()
        );

        if (existingItemIndex !== -1) {
          // تحديث الكمية إذا كان المنتج موجودًا
          cart.items[existingItemIndex].quantity += newItem.quantity;
        } else {
          // إضافة منتج جديد
          cart.items.push(newItem);
        }
      }

      // إعادة حساب الإجمالي
      cart.total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }

    await cart.save();
    res.status(201).json({
      cart,
      cartId: cart.cartId, // إرجاع cartId بدلاً من id
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
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
    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx === -1) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }

    // ضبط الكمية
    cart.items[idx].quantity = quantity;

    // إعادة حساب الإجمالي
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
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
    });
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
    const address = user.addresses.find((a) => a._id.toString() === addressId);
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
        const key = i.store.toString(); // ⇐ هنا
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

    res.json({
      deliveryFee: fee,
      cartTotal: cart.total,
      grandTotal: cart.total + fee,
    });
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
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  await cart.save();
  res.json(cart);
};
