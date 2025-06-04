// src/routes/job_v3/opportunityRoutes.ts

import express from "express";
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} from "../../controllers/job_V3/opportunityController";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: JobOpportunities
 *     description: إدارة فرص العمل والتقديم عليها
 */

/**
 * @swagger
 * /job/opportunities:
 *   post:
 *     summary: إنشاء فرصة عمل جديدة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) نشر فرصة عمل جديدة مع تفاصيلها مثل العنوان والوصف والميزانية.
 *     tags: [JobOpportunities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات فرصة العمل المراد إنشاؤها
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OpportunityInput'
 *     responses:
 *       201:
 *         description: تم إنشاء فرصة العمل بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء الفرصة.
 */
router.post("/", verifyFirebase, createOpportunity);

/**
 * @swagger
 * /job/opportunities:
 *   get:
 *     summary: جلب جميع فرص العمل
 *     description: يعرض قائمة بجميع فرص العمل المتاحة مع دعم التصفية أو الفرز إن وُجد.
 *     tags: [JobOpportunities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة فرص العمل بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الفرص.
 */
router.get("/", verifyFirebase, getOpportunities);

/**
 * @swagger
 * /job/opportunities/{id}:
 *   get:
 *     summary: جلب تفاصيل فرصة عمل محددة
 *     description: يعرض تفاصيل فرصة العمل بناءً على معرّفها.
 *     tags: [JobOpportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الفرصة المطلوب جلب تفاصيلها
 *     responses:
 *       200:
 *         description: تم جلب تفاصيل الفرصة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الفرصة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء جلب التفاصيل.
 */
router.get("/:id", verifyFirebase, getOpportunityById);

/**
 * @swagger
 * /job/opportunities/{id}:
 *   patch:
 *     summary: تحديث فرصة عمل بواسطة المعرف
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تعديل أدقّة تفاصيل فرصة العمل المنشورة بواسطة معرّفها.
 *     tags: [JobOpportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الفرصة المراد تحديثها
 *     requestBody:
 *       description: الحقول التي سيتم تحديثها في الفرصة (مثل العنوان أو الوصف أو الميزانية)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OpportunityInput'
 *     responses:
 *       200:
 *         description: تم تحديث الفرصة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الفرصة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث الفرصة.
 */
router.patch("/:id", verifyFirebase, updateOpportunity);

/**
 * @swagger
 * /job/opportunities/{id}:
 *   delete:
 *     summary: حذف فرصة عمل بواسطة المعرف
 *     description: يتيح للمستخدم المصادق عليه (Firebase) حذف فرصة العمل الخاصة به بواسطة معرّفها.
 *     tags: [JobOpportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الفرصة المراد حذفها
 *     responses:
 *       200:
 *         description: تم حذف الفرصة بنجاح.
 *       400:
 *         description: معرّف غير صالح أو محاولة حذف غير مصرح بها.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات غير كافية لحذف الفرصة.
 *       404:
 *         description: لم يتم العثور على الفرصة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء حذف الفرصة.
 */
router.delete("/:id", verifyFirebase, deleteOpportunity);

export default router;
