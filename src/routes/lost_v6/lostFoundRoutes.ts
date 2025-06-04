// src/routes/lost_v6/lostFoundRoutes.ts

import express from "express";
import {
  createPost,
  getPosts,
  getPostDetails,
  updatePostStatus,
} from "../../controllers/lost_v6/lostFoundController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: LostFound
 *     description: إدارة قسم المفقودات والموجدات
 */

/**
 * @swagger
 * /lostfound:
 *   post:
 *     summary: إنشاء إعلان جديد للمفقودات/الموجودات
 *     description: يتيح للمستخدم المصادق عليه نشر إعلان عن غرض مفقود أو معثور عليه.
 *     tags: [LostFound]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: تفاصيل الإعلان (العنوان، الوصف، الموقع، نوع الغرض، إلخ).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LostFoundPostInput'
 *     responses:
 *       201:
 *         description: تم إنشاء الإعلان بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LostFoundPost'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء الإعلان.
 */
router.post("/", createPost);

/**
 * @swagger
 * /lostfound:
 *   get:
 *     summary: جلب جميع الإعلانات
 *     description: يعرض قائمة بجميع إعلانات المفقودات والموجودات المتوفرة، مع دعم الفلترة والفرز إن وُجد.
 *     tags: [LostFound]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [lost, found, all]
 *         description: تصفية الإعلانات حسب الحالة (مفقود، موجود، جميعها)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: رقم الصفحة عند استخدام الترميز (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: عدد الإعلانات في كل صفحة
 *     responses:
 *       200:
 *         description: تم جلب قائمة الإعلانات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LostFoundPost'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الإعلانات.
 */
router.get("/", getPosts);

/**
 * @swagger
 * /lostfound/{id}:
 *   get:
 *     summary: جلب تفاصيل إعلان معين
 *     description: يعرض تفاصيل الإعلان بناءً على معرّف الإعلان المرسل في المسار.
 *     tags: [LostFound]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الإعلان المطلوب جلب تفاصيله
 *     responses:
 *       200:
 *         description: تم جلب تفاصيل الإعلان بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LostFoundPost'
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على الإعلان المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب تفاصيل الإعلان.
 */
router.get("/:id", getPostDetails);

/**
 * @swagger
 * /lostfound/{id}/status:
 *   patch:
 *     summary: تحديث حالة إعلان معين
 *     description: يتيح للمستخدم أو الأدمن تغيير حالة الإعلان (مثل مقبول، مرفوض، مغلق) بناءً على معرّف الإعلان.
 *     tags: [LostFound]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الإعلان المراد تحديث حالته
 *     requestBody:
 *       description: بيانات تحديث الحالة (الحالة الجديدة وأي ملاحظات أو أسباب).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, closed]
 *                 example: "approved"
 *                 description: الحالة الجديدة للإعلان
 *               note:
 *                 type: string
 *                 example: "تم العثور على الغرض وتم إغلاق الإعلان"
 *                 description: ملاحظة توضيحية حول التحديث
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث حالة الإعلان بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LostFoundPost'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات غير كافية لتحديث الحالة.
 *       404:
 *         description: لم يتم العثور على الإعلان المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث الحالة.
 */
router.patch("/:id/status", updatePostStatus);

export default router;
