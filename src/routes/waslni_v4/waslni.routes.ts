// src/routes/waslniRoutes.ts

import express from "express";
import {
  createBooking,
  acceptBooking,
  startRide,
  completeRide,
  uploadProof,
  cancelBooking,
  getAllBookings,
  submitReview,
  sendSOS,
  confirmOTP,
  getMyBookings,
  getWaslniStats,
} from "../../controllers/waslni_v5/waslniController";
import multer from "multer";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { verifyAdmin } from "../../middleware/verifyAdmin";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // مؤقتًا، يمكن استبداله بتكامل سحابي لاحقًا

/**
 * @swagger
 * tags:
 *   - name: Waslni
 *     description: عمليات حجز وخدمات Waslni
 */

/**
 * @swagger
 * /waslni/request:
 *   post:
 *     summary: إنشاء طلب حجز جديد
 *     description: يتيح للمستخدم المصادق عليه (Firebase) إنشاء طلب حجز جديد في نظام Waslni.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات إنشاء الحجز (مثل الموقع، الوجهة، نوع الخدمة، إلخ)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WaslniBookingInput'
 *     responses:
 *       201:
 *         description: تم إنشاء الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaslniBooking'
 *       400:
 *         description: بيانات الطلب غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 */
router.post("/request", verifyFirebase, createBooking);

/**
 * @swagger
 * /waslni/{id}/cancel:
 *   patch:
 *     summary: إلغاء حجز قائم
 *     description: يتيح للمستخدم إلغاء الحجز الحالي بواسطة معرّف الحجز.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز المراد إلغاؤه
 *     responses:
 *       200:
 *         description: تم إلغاء الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaslniBooking'
 *       400:
 *         description: لا يمكن إلغاء هذا الحجز (ربما تم الانطلاق أو الاكتمال).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 */
router.patch("/:id/cancel", verifyFirebase, cancelBooking);

/**
 * @swagger
 * /waslni/stats:
 *   get:
 *     summary: جلب إحصائيات Waslni
 *     description: يعرض إحصائيات عامة (عدد الحجوزات، متوسط الوقت، إلخ) لمستخدم الأدمن.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب الإحصائيات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaslniStats'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 */
router.get("/stats", verifyFirebase, verifyAdmin, getWaslniStats);

/**
 * @swagger
 * /waslni/{id}/accept:
 *   patch:
 *     summary: قبول طلب حجز من قبل السائق
 *     description: يتيح للسائق المصادق عليه قبول طلب حجز معين بواسطة معرّفه.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز المراد قبوله
 *     responses:
 *       200:
 *         description: تم قبول الحجز بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaslniBooking'
 *       400:
 *         description: لا يمكن قبول هذا الحجز (ربما تم إلغاؤه أو مكتمل).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 */
router.patch("/:id/accept", verifyFirebase, acceptBooking);

/**
 * @swagger
 * /waslni/{id}/start:
 *   patch:
 *     summary: بدء الرحلة
 *     description: يتيح للسائق المصادق عليه بدء الرحلة بالنسبة لحجز معين.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز الذي يراد بدء الرحلة له
 *     responses:
 *       200:
 *         description: تم بدء الرحلة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaslniBooking'
 *       400:
 *         description: لا يمكن بدء هذه الرحلة (ربما لم يتم قبول الحجز بعد).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 */
router.patch("/:id/start", verifyFirebase, startRide);

/**
 * @swagger
 * /waslni/{id}/complete:
 *   patch:
 *     summary: إتمام الرحلة
 *     description: يتيح للسائق المصادق عليه إتمام الرحلة وإنهاء الحجز.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز المراد إنهاء الرحلة له
 *     responses:
 *       200:
 *         description: تم إتمام الرحلة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaslniBooking'
 *       400:
 *         description: لا يمكن إتمام هذه الرحلة (ربما لم تبدأ بعد).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 */
router.patch("/:id/complete", verifyFirebase, completeRide);

/**
 * @swagger
 * /waslni/{id}/proof:
 *   post:
 *     summary: رفع صورة إثبات للرحلة
 *     description: يمكن للسائق المصادق عليه رفع صورة (مثل فاتورة أو إيصال) لإثبات إتمام الرحلة.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز الذي يُرفع إثباته
 *     requestBody:
 *       description: يجب إرسال ملف الصورة باستخدام صيغة FormData تحت الحقل "image"
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: ملف الصورة (JPEG, PNG, إلخ)
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: تم رفع الصورة بنجاح وربطها بالحجز.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://cdn.example.com/waslni/proof/ride123.png"
 *       400:
 *         description: لم يتم تضمين ملف صالح أو نوع الملف غير مدعوم.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحميل الصورة.
 */
router.post("/:id/proof", verifyFirebase, upload.single("image"), uploadProof);

/**
 * @swagger
 * /waslni:
 *   get:
 *     summary: جلب جميع الحجوزات (للأدمن)
 *     description: يتيح للأدمن المصادق عليه الاطّلاع على قائمة بجميع الحجوزات الموجودة.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة الحجوزات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WaslniBooking'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 */
router.get("/", verifyAdmin, getAllBookings);

/**
 * @swagger
 * /waslni/{id}/review:
 *   post:
 *     summary: تقديم تقييم بعد الرحلة
 *     description: يتيح للمستخدم المصادق عليه إرسال تقييم للحجز بعد إتمام الرحلة.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز الذي سيتم تقييمه
 *     requestBody:
 *       description: بيانات التقييم
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WaslniReviewInput'
 *     responses:
 *       200:
 *         description: تمَّ تقديم التقييم بنجاح.
 *       400:
 *         description: بيانات التقييم غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 */
router.post("/:id/review", verifyFirebase, submitReview);

/**
 * @swagger
 * /waslni/{id}/sos:
 *   post:
 *     summary: إرسال نداء استغاثة للطوارئ (SOS)
 *     description: يرسل المستخدم المصادق عليه نداء استغاثة للطوارئ بناءً على معرّف الحجز.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز الذي يحتاج مساعدة طوارئ
 *     requestBody:
 *       description: يمكن أن يتضمّن نصًا إضافيًا يوضّح الحالة الطارئة
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: رسالة نصية توضيحية للاحتياج للطوارئ
 *             example:
 *               message: "مريض في الخلفية يحتاج إسعاف عاجل"
 *     responses:
 *       200:
 *         description: تم إرسال نداء الاستغاثة بنجاح.
 *       400:
 *         description: لم يتم تضمين تفاصيل كافية أو تنسيق خاطئ.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 */
router.post("/:id/sos", verifyFirebase, sendSOS);

/**
 * @swagger
 * /waslni/{id}/confirm-otp:
 *   post:
 *     summary: تأكيد رمز OTP بعد بدء الرحلة
 *     description: يتيح للمستخدم المصادق عليه إدخال رمز التحقق (OTP) بعد بدء الرحلة.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الحجز الذي يُؤكد الـ OTP له
 *     requestBody:
 *       description: يحتوي على رمز OTP للتحقق من بدء الرحلة
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otpCode:
 *                 type: string
 *                 description: رمز التحقق المرسل إلى المستخدم
 *             required:
 *               - otpCode
 *     responses:
 *       200:
 *         description: تمّ تأكيد الرمز بنجاح.
 *       400:
 *         description: رمز OTP غير صحيح أو منتهي الصلاحية.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الحجز المطلوب.
 */
router.post("/:id/confirm-otp", verifyFirebase, confirmOTP);

/**
 * @swagger
 * /waslni/my-bookings:
 *   get:
 *     summary: جلب الحجوزات الخاصة بالمستخدم
 *     description: يعرض جميع الحجوزات التي قام المستخدم المصادق عليه بإنشائها أو التي يشارك فيها.
 *     tags: [Waslni]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب الحجوزات الخاصة بالمستخدم بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WaslniBooking'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 */
router.get("/my-bookings", verifyFirebase, getMyBookings);

export default router;
