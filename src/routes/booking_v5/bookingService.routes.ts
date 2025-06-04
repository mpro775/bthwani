// src/routes/bookingV5/serviceRoutes.ts

import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getAvailability,
} from "../../controllers/booking_V5/bookingService.controller";
import {
  createBooking,
  updateBookingStatus,
} from "../../controllers/booking_V5/booking.controller";
import {
  submitReview,
  getServiceReviews,
} from "../../controllers/booking_V5/review.controller";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: BookingV5
 *     description: إدارة خدمات الحجز والطلبات والتقييمات
 */

/**
 * @swagger
 * /booking/services:
 *   post:
 *     summary: إنشاء خدمة جديدة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) إنشاء خدمة حجز جديدة.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات الخدمة الجديدة (اسم الخدمة، الوصف، السعر، وغيرها).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceInput'
 *     responses:
 *       201:
 *         description: تم إنشاء الخدمة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: البيانات المقدمة غير صالحة أو ناقصة.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء الخدمة.
 */
router.post("/services", verifyFirebase, createService);

/**
 * @swagger
 * /booking/services:
 *   get:
 *     summary: جلب جميع الخدمات
 *     description: يعرض قائمة بجميع خدمات الحجز المتاحة مع دعم الفلترة والفرز إن وجد.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: معرّف الفئة لتصفية الخدمات
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: رقم الصفحة عند استخدام الترقيم (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: عدد الخدمات في كل صفحة
 *     responses:
 *       200:
 *         description: تم جلب قائمة الخدمات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الخدمات.
 */
router.get("/services", verifyFirebase, getAllServices);

/**
 * @swagger
 * /booking/services/{id}:
 *   get:
 *     summary: جلب تفاصيل خدمة معينة
 *     description: يعرض تفاصيل خدمة الحجز المحددة بواسطة المعرف.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المطلوب جلب تفاصيلها
 *     responses:
 *       200:
 *         description: تم جلب تفاصيل الخدمة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على الخدمة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء جلب التفاصيل.
 */
router.get("/services/:id", verifyFirebase, getServiceById);

/**
 * @swagger
 * /booking/services/{id}:
 *   patch:
 *     summary: تحديث خدمة معينة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تعديل بيانات خدمة معينة بواسطة المعرف.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المراد تعديلها
 *     requestBody:
 *       description: الحقول المراد تحديثها في الخدمة (مثل الاسم، الوصف، السعر، إلخ).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceInput'
 *     responses:
 *       200:
 *         description: تم تحديث الخدمة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على الخدمة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث الخدمة.
 */
router.patch("/services/:id", verifyFirebase, updateService);

/**
 * @swagger
 * /booking/services/{id}:
 *   delete:
 *     summary: حذف أو تعطيل خدمة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) حذف أو تعطيل خدمة معينة بواسطة المعرف.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المراد حذفها أو تعطيلها
 *     responses:
 *       200:
 *         description: تم حذف أو تعطيل الخدمة بنجاح.
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على الخدمة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء حذف الخدمة.
 */
router.delete("/services/:id", verifyFirebase, deleteService);

/**
 * @swagger
 * /booking/services/{id}/availability:
 *   get:
 *     summary: جلب مدى التوافر لخدمة
 *     description: يعرض للمستخدم المصادق عليه (Firebase) تقويم أوقات التوافر الخاصة بالخدمة المحددة.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المراد جلب تقويمها
 *     responses:
 *       200:
 *         description: تم جلب مدى التوافر بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serviceId:
 *                   type: string
 *                   example: "svc123"
 *                   description: معرّف الخدمة
 *                 availability:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-07-01"
 *                         description: التاريخ المتاح
 *                       slots:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "09:00-11:00"
 *                         description: الفترات الزمنية المتاحة
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على الخدمة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء جلب مدى التوافر.
 */
router.get("/services/:id/availability", verifyFirebase, getAvailability);

/**
 * @swagger
 * /booking/services/{id}/book:
 *   post:
 *     summary: إنشاء حجز جديد لخدمة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تقديم طلب حجز لخدمة معينة بواسطة المعرف.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المراد حجزها
 *     requestBody:
 *       description: بيانات الحجز (التاريخ والوقت وأي تفاصيل إضافية).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *         description: تم إنشاء الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على الخدمة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء الحجز.
 */
router.post("/services/:id/book", verifyFirebase, createBooking);

/**
 * @swagger
 * /booking/services/{id}/review:
 *   post:
 *     summary: إنشاء تقييم لخدمة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تقديم تقييم لخدمة معينة بعد اكتمالها.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المراد تقييمها
 *     requestBody:
 *       description: بيانات التقييم (التقييم والنص).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: تم تقديم التقييم بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على الخدمة أو الحجز المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تقديم التقييم.
 */
router.post("/services/:id/review", verifyFirebase, submitReview);

/**
 * @swagger
 * /booking/services/{id}/reviews:
 *   get:
 *     summary: جلب جميع التقييمات لخدمة
 *     description: يعرض جميع التقييمات المقدمة لخدمة معينة بواسطة المعرف مع المتوسط العام للتقييم.
 *     tags: [BookingV5]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخدمة المراد جلب تقييماتها
 *     responses:
 *       200:
 *         description: تم جلب قائمة التقييمات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على الخدمة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء جلب التقييمات.
 */
router.get("/services/:id/reviews", verifyFirebase, getServiceReviews);

export default router;
