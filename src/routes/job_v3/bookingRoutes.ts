// src/routes/job_v3/bookingRoutes.ts

import express from "express";
import {
  createBookingRequest,
  updateBookingStatus,
} from "../../controllers/job_V3/bookingController";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: JobBooking
 *     description: إدارة حجز خدمات الوظائف (Job Booking)
 */

/**
 * @swagger
 * /job/booking/request:
 *   post:
 *     summary: إنشاء طلب حجز خدمة جديدة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) إنشاء طلب حجز لخدمة معيّنة لدى مستقل.
 *     tags: [JobBooking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات طلب الحجز (مثل معرف المستقل، تاريخ الخدمة، وصف العمل، إلخ)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingRequestInput'
 *     responses:
 *       201:
 *         description: تم إنشاء طلب الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: المستقل غير موجود.
 *       500:
 *         description: خطأ في الخادم أثناء معالجة الطلب.
 */
router.post("/request", verifyFirebase, createBookingRequest);

/**
 * @swagger
 * /job/booking/{id}/status:
 *   patch:
 *     summary: تحديث حالة طلب الحجز بواسطة المعرف
 *     description: يتيح للمستخدم المصادق عليه (Firebase) أو الأدمن (حسب صلاحياتك) تعديل حالة طلب الحجز (مثل: قيد الانتظار، مقبول، مرفوض، مكتمل).
 *     tags: [JobBooking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف طلب الحجز المراد تحديث حالته
 *     requestBody:
 *       description: بيانات تحديث الحالة (مثل الحالة الجديدة وملاحظة اختيارية).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, completed]
 *                 example: "accepted"
 *                 description: الحالة الجديدة لطلب الحجز
 *               note:
 *                 type: string
 *                 example: "تم قبول الطلب، سيتم التواصل قريبًا"
 *                 description: ملاحظة إضافية حول سبب التحديث (اختياري)
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث حالة طلب الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات غير كافية لتحديث حالة الطلب.
 *       404:
 *         description: لم يتم العثور على طلب الحجز المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث حالة الطلب.
 */
router.patch("/:id/status", verifyFirebase, updateBookingStatus);

export default router;
