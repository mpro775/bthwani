// src/routes/deliveryMarketplaceV1/sheinCheckoutRoutes.ts

import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { SheinCart } from "../../models/delivry_Marketplace_V1/sheincart";
import { User } from "../../models/user";
import { SheinOrder } from "../../models/delivry_Marketplace_V1/SheinOrder";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: DeliveryShein
 *     description: إدارة عمليات الدفع والطلبات الخاصة بشاين شوب في سوق التوصيل V1
 */

/**
 * @swagger
 * /delivery/checkout:
 *   post:
 *     summary: تنفيذ عملية الدفع وإتمام الطلب لشاين شوب
 *     description: |
 *       يجري معاملة آمنة عبر جلسة Mongoose لإنشاء طلب من عناصر عربة المستخدم (SheinCart)،
 *       مطروحًا قيمة المجموع من رصيد المحفظة. عند نجاح الدفع، يُنشأ مستند جديد في SheinOrder،
 *       ثم تُحذف العربة. إذا فشل أي جزء، يتم التراجع عن المعاملة بأكملها.
 *     tags: [DeliveryShein]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: لا حاجة لإرسال أي حقل إضافي؛ يتم استخدام userId من التوكين لجلب العربة.
 *       required: false
 *     responses:
 *       201:
 *         description: تم تنفيذ الطلب بنجاح وإرجاع معرّف الطلب.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "تم تنفيذ الطلب"
 *                 orderId:
 *                   type: string
 *                   format: mongoId
 *                   example: "60f5a3e8c2a4f12b34d56789"
 *                   description: معرّف الطلب الذي تم إنشاؤه
 *       400:
 *         description: خطأ في الطلب (مثلاً: العربة فارغة).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "السلة فارغة"
 *       401:
 *         description: المستخدم غير مصرح أو غير موجود.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "غير مصرح"
 *       402:
 *         description: رصيد المحفظة غير كافٍ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "رصيد المحفظة غير كافٍ"
 *       404:
 *         description: المستخدم غير موجود.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "المستخدم غير موجود"
 *       500:
 *         description: خطأ داخلي في الخادم أثناء معالجة الطلب.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "خطأ داخلي"
 *                 error:
 *                   type: string
 *                   example: "Error: Some database error"
 */
router.post("/delivery/checkout", async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?.id;
    if (!userId) {
       res.status(401).json({ message: "غير مصرح" });
       return;
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
       res.status(404).json({ message: "المستخدم غير موجود" });
       return;
    }

    const cart = await SheinCart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
       res.status(400).json({ message: "السلة فارغة" });
       return;
    }

    const total = cart.items.reduce(
      (sum, i) => sum + i.price * (i.quantity || 1),
      0
    );

    if ((user.wallet?.balance || 0) < total) {
       res.status(402).json({ message: "رصيد المحفظة غير كافٍ" });
       return;
    }

    user.wallet.balance -= total;
    await user.save({ session });

    const sheinOrder = new SheinOrder({
      userId,
      items: cart.items,
      totalPrice: total,
      status: "paid",
      paidAt: new Date(),
    });

    await sheinOrder.save({ session });
    await SheinCart.deleteOne({ _id: cart._id }).session(session);

    await session.commitTransaction();
     res
      .status(201)
      .json({ message: "تم تنفيذ الطلب", orderId: sheinOrder._id });
      return;
  } catch (err: any) {
    await session.abortTransaction();
     res.status(500).json({ message: "خطأ داخلي", error: err.message });
     return;
  } finally {
    session.endSession();
  }
});

export default router;
