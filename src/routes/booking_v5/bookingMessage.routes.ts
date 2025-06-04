// src/routes/bookingV5/messageRoutes.ts

import express from "express";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import {
  createMessage,
  getMessages,
} from "../../controllers/booking_V5/bookingMessage.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: BookingV5Messages
 *     description: إدارة الرسائل الخاصة بحجوزات BookingV5
 */

/**
 * @swagger
 * /booking/services/{bookingId}/messages:
 *   post:
 *     summary: إرسال رسالة جديدة لحجز محدد
 *     description: يتيح للمستخدم المصادق عليه (Firebase) إرسال رسالة مرتبطة بحجز معين باستخدام معرّف الحجز.
 *     tags: [BookingV5Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز الذي سيتم إرسال الرسالة إليه
 *     requestBody:
 *       description: نص الرسالة التي سيتم إرسالها
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "مرحبًا، هل تم تأكيد موعد الخدمة؟"
 *                 description: نص الرسالة
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: تم إرسال الرسالة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageId:
 *                   type: string
 *                   example: "msg123"
 *                   description: معرّف الرسالة التي تم إنشاؤها
 *                 bookingId:
 *                   type: string
 *                   example: "booking456"
 *                   description: معرّف الحجز المرتبط بالرسالة
 *                 senderId:
 *                   type: string
 *                   example: "user789"
 *                   description: معرّف المستخدم الذي أرسل الرسالة
 *                 content:
 *                   type: string
 *                   example: "مرحبًا، هل تم تأكيد موعد الخدمة؟"
 *                   description: نص الرسالة
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-15T10:20:30Z"
 *                   description: تاريخ ووقت إنشاء الرسالة
 *       400:
 *         description: البيانات المقدمة غير صالحة (مثلاً: نص الرسالة مفقود).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء إرسال الرسالة.
 */
router.post(
  "/:bookingId/messages",
  verifyFirebase,
  createMessage
);

/**
 * @swagger
 * /booking/services/{bookingId}/messages:
 *   get:
 *     summary: جلب جميع الرسائل لحجز معين
 *     description: يعرض قائمة بالرسائل المرتبطة بحجز محدد باستخدام معرّف الحجز.
 *     tags: [BookingV5Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز المطلوب جلب الرسائل الخاصة به
 *     responses:
 *       200:
 *         description: تم جلب قائمة الرسائل بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   messageId:
 *                     type: string
 *                     example: "msg123"
 *                     description: معرّف الرسالة
 *                   bookingId:
 *                     type: string
 *                     example: "booking456"
 *                     description: معرّف الحجز المرتبط بالرسالة
 *                   senderId:
 *                     type: string
 *                     example: "user789"
 *                     description: معرّف المستخدم الذي أرسل الرسالة
 *                   content:
 *                     type: string
 *                     example: "مرحبًا، هل تم تأكيد موعد الخدمة؟"
 *                     description: نص الرسالة
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-15T10:20:30Z"
 *                     description: تاريخ ووقت إنشاء الرسالة
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الرسائل أو الحجز المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الرسائل.
 */
router.get(
  "/:bookingId/messages",
  verifyFirebase,
  getMessages
);

export default router;
