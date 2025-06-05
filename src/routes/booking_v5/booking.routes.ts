// src/routes/bookingV5/bookingRoutes.ts

import express from "express";
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from "../../controllers/booking_V5/booking.controller";
import {
  getMyBookings,
  getServiceBookings,
} from "../../controllers/booking_V5/bookingService.controller";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: BookingV5
 *     description: إدارة الحجوزات والخدمات المتعلقة بها
 */

/**
 * @swagger
 * /booking/my:
 *   get:
 *     summary: جلب حجوزاتي
 *     description: يعرض للمستخدم المصادق عليه (Firebase) قائمة بكل الحجوزات التي قام بها.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة الحجوزات الخاصة بالمستخدم بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الحجوزات.
 */
router.get("/my", verifyFirebase, getMyBookings);

/**
 * @swagger
 * /booking/service/{id}:
 *   get:
 *     summary: جلب حجوزات خدمة معينة
 *     description: يعرض قائمة الحجوزات المرتبطة بخدمة مُحددة بواسطة المعرّف.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المراد جلب حجوزاتها
 *     responses:
 *       200:
 *         description: تم جلب الحجوزات الخاصة بالخدمة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       400:
 *         description: معرّف الخدمة غير صالح.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الخدمة أو الحجوزات الخاصة بها.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الحجوزات.
 */
router.get("/service/:id", verifyFirebase, getServiceBookings);

/**
 * @swagger
 * /booking/{id}/status:
 *   patch:
 *     summary: تحديث حالة حجز
 *     description: يتيح للمستخدم المصادق عليه (Firebase) أو الأدمن (حسب صلاحيات) تعديل حالة الحجز (مثل: pending, confirmed, completed, cancelled) بواسطة معرّف الحجز.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز المراد تحديث حالته
 *     requestBody:
 *       description: البيانات اللازمة لتحديث الحالة (حقل status وقيمة جديدة).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, in_progress, completed, cancelled]
 *                 example: "confirmed"
 *                 description: الحالة الجديدة للحجز
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث حالة الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: البيانات المقدمة غير صالحة (مثلاً: status غير مدعوم).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات غير كافية لتحديث الحالة.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث حالة الحجز.
 */
router.patch("/:id/status", verifyFirebase, updateBookingStatus);
router.get("/", verifyFirebase, getAllBookings);

/**
 * @swagger
 * /booking/{id}:
 *   get:
 *     summary: جلب تفاصيل حجز معين
 *     description: يعرض تفاصيل حجز محدد بواسطة معرّف الحجز.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز المراد جلب تفاصيله
 *     responses:
 *       200:
 *         description: تم جلب تفاصيل الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب تفاصيل الحجز.
 */
router.get("/:id", verifyFirebase, getBookingById);

export default router;
