// src/routes/bloodRoutes.ts

import express from "express";
import {
  createBloodRequest,
  getAllBloodDonors,
  markDonationComplete,
} from "../../controllers/blood_v7/bloodRequestController";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { BloodMessage } from "../../models/blood_V7/BloodMessageSchema";
import { User } from "../../models/user";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: BloodV7
 *     description: إدارة طلبات الدم والتبرعات
 */

/**
 * @swagger
 * /blood/request:
 *   post:
 *     summary: إنشاء طلب دم جديد
 *     description: يتيح للمستخدم المصادق عليه تقديم طلب دم مع جميع التفاصيل اللازمة.
 *     tags: [BloodV7]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات طلب الدم (فصيلة الدم، الكمية، الموقع، وغيرها).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBloodRequestInput'
 *     responses:
 *       201:
 *         description: تم إنشاء طلب الدم بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodRequest'
 *       400:
 *         description: البيانات المقدمة غير صالحة أو ناقصة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء طلب الدم.
 */
router.post("/blood/request", verifyFirebase, createBloodRequest);

/**
 * @swagger
 * /blood/complete:
 *   post:
 *     summary: تأكيد إتمام التبرع بالدم
 *     description: يتيح للمستلم أو المسؤول المصادق عليه علامة أن التبرع بالدم قد اكتمل.
 *     tags: [BloodV7]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات اكتمال التبرع (معرّف الطلب وأي ملاحظات إضافية).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteDonationInput'
 *     responses:
 *       200:
 *         description: تم تأكيد اكتمال التبرع بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodDonation'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على طلب الدم المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تأكيد اكتمال التبرع.
 */
router.post("/blood/complete", verifyFirebase, markDonationComplete);

/**
 * @swagger
 * /blood/messages:
 *   post:
 *     summary: إرسال رسالة خاصة بطلب الدم
 *     description: يتيح للمستخدم المصادق عليه إرسال رسالة مرتبطة بطلب دم محدد.
 *     tags: [BloodV7]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: معرف طلب الدم ونص الرسالة.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *                 example: "req123"
 *                 description: معرّف طلب الدم المرتبط بالرسالة
 *               text:
 *                 type: string
 *                 example: "هل هناك مانع لشريحة الدم O-؟"
 *                 description: نص الرسالة
 *             required:
 *               - requestId
 *               - text
 *     responses:
 *       201:
 *         description: تم إرسال الرسالة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodMessage'
 *       400:
 *         description: البيانات المقدمة غير صالحة أو ناقصة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: طلب الدم المرتبط غير موجود.
 *       500:
 *         description: خطأ في الخادم أثناء إرسال الرسالة.
 */
router.post("/blood/messages", verifyFirebase, async (req, res) => {
  const { requestId, text } = req.body;
  if (!text || !requestId) {
     res.status(400).json({ message: "بيانات ناقصة" });
     return;
  }
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
     res.status(400).json({ message: "requestId غير صالح" });
     return;
  }
  // أكمل الإنشاء
  try {
    const senderId = req.user.id;
    const message = await BloodMessage.create({ requestId, text, senderId });
     res.json(message);
     return;
  } catch (err) {
    console.error(err);
     res.status(500).json({ message: "خطأ في السيرفر", error: err });
     return;
  }
});


/**
 * @swagger
 * /blood/messages/{requestId}:
 *   get:
 *     summary: جلب جميع الرسائل لطلب دم معين
 *     description: يعرض للمستخدم المصادق عليه جميع الرسائل المتعلقة بطلب الدم بواسطة معرّف الطلب.
 *     tags: [BloodV7]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف طلب الدم لجلب الرسائل المتعلقة به
 *     responses:
 *       200:
 *         description: تم جلب الرسائل بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BloodMessage'
 *       400:
 *         description: معرّف الطلب غير صالح.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: طلب الدم أو الرسائل المرتبطة غير موجودة.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الرسائل.
 */
router.get("/blood/messages/:requestId", verifyFirebase, async (req, res) => {
  const { requestId } = req.params;
  // نتحقق أولاً أنّ requestId غير فارغ وصالح كبنية ObjectId
  if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
     res.status(400).json({ message: "requestId غير صالح" });
     return;
  }

  try {
    const messages = await BloodMessage.find({ requestId }).sort({ sentAt: 1 });
     res.json(messages);
     return;
  } catch (err) {
    console.error(err);
     res.status(500).json({ message: "خطأ في السيرفر", error: err });
     return;
  }
});

/**
 * @swagger
 * /blood/donors:
 *   get:
 *     summary: جلب قائمة جميع المتبرعين بالدم
 *     description: يعرض للمستخدم المصادق عليه قائمة بكل المتبرعين المسجلين وكذلك بيانات التواصل الخاصة بهم.
 *     tags: [BloodV7]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة المتبرعين بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BloodDonor'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المتبرعين.
 */
router.get("/blood/donors",  getAllBloodDonors);

export default router;
