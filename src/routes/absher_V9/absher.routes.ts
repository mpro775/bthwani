// src/routes/absherRoutes.ts

import express from "express";
import {
  submitRequest,
  getMyRequests,
  assignRequestToProvider,
  providerRespond,
  withdrawPercentage,
} from "../../controllers/absher_v9/absher.controller";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Absher
 *     description: إدارة طلبات نظام أبشر للمستخدمين والمزوّدين
 */

/**
 * @swagger
 * /absher/request:
 *   post:
 *     summary: إنشاء طلب جديد في نظام أبشر
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تقديم طلب خدمة عبر نظام أبشر المهني.
 *     tags: [Absher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: تفاصيل طلب أبشر (نوع الخدمة، البيانات الشخصية، التفاصيل المطلوبة)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AbsherRequestInput'
 *     responses:
 *       201:
 *         description: تم إنشاء الطلب بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AbsherRequest'
 *       400:
 *         description: بيانات الطلب غير صالحة أو ناقصة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء الطلب.
 */
router.post("/absher/request", verifyFirebase, submitRequest);

/**
 * @swagger
 * /absher/my-requests:
 *   get:
 *     summary: جلب جميع طلبات المستخدم الحالية
 *     description: يعرض للمستخدم المصادق عليه (Firebase) قائمة بجميع الطلبات التي قدمها في نظام أبشر.
 *     tags: [Absher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة الطلبات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AbsherRequest'
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الطلبات.
 */
router.get("/absher/my-requests", verifyFirebase, getMyRequests);

/**
 * @swagger
 * /absher/admin/assign:
 *   patch:
 *     summary: تعيين طلب أبشر إلى مزوّد
 *     description: يتيح للمسؤول المصادق عليه تعيين طلب أبشر معين إلى مزوّد خدمة مختص.
 *     tags: [Absher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: معرِّف الطلب ومعرِّف المزوِّد اللذين سيتم تعيينهما
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *                 example: "absher343536"
 *                 description: معرِّف طلب أبشر المراد تعيينه
 *               providerId:
 *                 type: string
 *                 example: "prov789"
 *                 description: معرِّف المزوِّد الذي سيتم تعيين الطلب إليه
 *             required:
 *               - requestId
 *               - providerId
 *     responses:
 *       200:
 *         description: تم تعيين الطلب بنجاح إلى المزوِّد.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AbsherRequest'
 *       400:
 *         description: بيانات التعيين غير صالحة (مثلاً: الطلب أو المزوِّد غير موجود).
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات المسؤول فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على الطلب أو المزوِّد المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تعيين الطلب.
 */
router.patch("/absher/admin/assign", verifyFirebase, assignRequestToProvider);

/**
 * @swagger
 * /absher/provider/respond:
 *   patch:
 *     summary: استجابة المزوِّد لطلب أبشر
 *     description: يتيح لمزوِّد الخدمة المصادق عليه قبول أو رفض طلب أبشر محدد.
 *     tags: [Absher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: معرِّف الطلب وحالة الاستجابة والتعليقات الاختيارية
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *                 example: "absher343536"
 *                 description: معرِّف طلب أبشر المراد الاستجابة له
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 example: "accepted"
 *                 description: حالة استجابة المزوِّد للطلب
 *               comment:
 *                 type: string
 *                 example: "سأبدأ بالإجراءات بعد غدٍ"
 *                 description: تعليق اختياري من المزوِّد
 *             required:
 *               - requestId
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث حالة الطلب بناءً على استجابة المزوِّد بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AbsherRequest'
 *       400:
 *         description: بيانات الاستجابة غير صالحة (مثلاً: حالة غير مدعومة).
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات المزوِّد فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على الطلب المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث الاستجابة.
 */
router.patch("/absher/provider/respond", verifyFirebase, providerRespond);

/**
 * @swagger
 * /absher/provider/withdraw:
 *   post:
 *     summary: سحب نسبة المزوِّد
 *     description: يتيح لمزوِّد الخدمة المصادق عليه سحب نسبة محددة من عمولة النظام أو الرسوم المكتسبة.
 *     tags: [Absher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: معرِّف المزوِّد والمبلغ المراد سحبه
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerId:
 *                 type: string
 *                 example: "prov789"
 *                 description: معرِّف المزوِّد الذي يرغب في السحب
 *               amount:
 *                 type: number
 *                 example: 100.0
 *                 description: المبلغ المراد سحبه من رصيد المزوِّد
 *             required:
 *               - providerId
 *               - amount
 *     responses:
 *       200:
 *         description: تمّت عملية السحب بنجاح، وتم تحديث رصيد المزوِّد.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 providerId:
 *                   type: string
 *                   example: "prov789"
 *                 withdrawnAmount:
 *                   type: number
 *                   example: 100.0
 *                 remainingBalance:
 *                   type: number
 *                   example: 450.0
 *       400:
 *         description: بيانات السحب غير صالحة (مثلاً: المبلغ أكبر من الرصيد).
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات المزوِّد فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على المزوِّد المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء عملية السحب.
 */
router.post("/absher/provider/withdraw", verifyFirebase, withdrawPercentage);

export default router;
