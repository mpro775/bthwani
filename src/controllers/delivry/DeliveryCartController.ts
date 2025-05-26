import { Request, Response } from 'express';
import DeliveryCart from '../../models/delivry/DeliveryCart';
import { v4 as uuidv4 } from 'uuid';

interface RemoveItemParams {
  cartId?: string;
  userId?: string;
  productId: string;
}


export const addToCart = async (req: Request, res: Response) => {
  const { cartId: cid, userId, productId, name, price, quantity, storeId, image } = req.body;
  const cartId = cid || uuidv4();
  const filter: any = userId ? { userId } : { cartId };
  let cart = await DeliveryCart.findOne(filter);

  if (cart && cart.storeId.toString() !== storeId) {
     res.status(400).json({ message: "لا يمكن طلب من متجر مختلف" });
     return;
  }

  const item = { productId, name, price, quantity, storeId, image };
  if (!cart) {
    cart = new DeliveryCart({ cartId, userId, storeId, items: [item], total: price * quantity });
  } else {
    const idx = cart.items.findIndex(i => i.productId.toString() === productId);
    if (idx > -1) cart.items[idx].quantity += quantity;
    else cart.items.push(item);
    cart.total += price * quantity;
  }

  await cart.save();
   res.status(201).json({ cart, cartId: cart.cartId });
   return;
};


export const getCart = async (req: Request, res: Response) => {
  try {
    const { cartId, userId } = req.params;
    const filter: any = userId ? { userId } : { cartId };
    const cart = await DeliveryCart.findOne(filter);
    if (!cart) {
       res.status(404).json({ message: 'سلة فارغة' });
       return;
    }
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const { cartId, userId } = req.params;
    const filter: any = userId ? { userId } : { cartId };
    await DeliveryCart.findOneAndDelete(filter);
    res.json({ message: 'تم حذف السلة بنجاح' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const mergeCart = async (req: Request, res: Response) => {
  const userId = req.user!.id;    // تأكدنا من verifyToken
  const guestItems = req.body.items as Array<{ productId: string; quantity: number }>;
  if (!Array.isArray(guestItems) || guestItems.length === 0) {
     res.status(400).json({ message: 'لا توجد عناصر للدمج' });
     return;
  }

  // ابني أو حدّث السلة للمستخدم
  const cart = await DeliveryCart.findOneAndUpdate(
    { userId },
    {
      $inc: { total: 0 }, 
      $setOnInsert: { userId, storeId: req.body.storeId },
      $push: { items: { $each: guestItems } }
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
    const carts = await DeliveryCart.find({ createdAt: { $lt: THIRTY_MINUTES_AGO } });
    res.json(carts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeItem = async (  req: Request<RemoveItemParams>, res: Response) => {
  const { cartId, userId, productId } = { ...req.params, ...(req.params.userId && { userId: req.params.userId }) };
  const filter: any = userId ? { userId } : { cartId };
  const cart = await DeliveryCart.findOne(filter);
  if (!cart) {
res.status(404).json({ message: 'سلة غير موجودة' });
    return;
  } 
  cart.items = cart.items.filter(i => i.productId.toString() !== productId);
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  await cart.save();
  res.json(cart);
};
