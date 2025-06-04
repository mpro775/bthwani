// src/routes/charityRoutes.ts

import express from "express";
import {
  postDonation,
  getMyDonations,
  getUnassignedDonations,
  assignToOrganization,
} from "../../controllers/Charity_V10/charity.controller";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: CharityV10
 *     description: إدارة عمليات التبرع والتوزيع في قسم العمل الخيري
 */

/**
 * @swagger
 * /charity/post:
 *   post:
 *     summary: نشر تبرع جديد
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تسجيل تبرع جديد في النظام.
 *     tags: [CharityV10]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات التبرع (مثل نوع التبرع، الكمية، الموقع، وتفاصيل الاتصال).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "طعام"
 *                 description: نوع العنصر المتبرع به
 *               quantity:
 *                 type: integer
 *                 example: 10
 *                 description: الكمية أو العدد المتبرع به
 *               location:
 *                 type: string
 *                 example: "الرياض، حي العليا"
 *                 description: موقع التبرع
 *               contactInfo:
 *                 type: string
 *                 example: "+966501234567"
 *                 description: معلومات الاتصال بالمتبرع
 *             required:
 *               - type
 *               - quantity
 *               - location
 *               - contactInfo
 *     responses:
 *       201:
 *         description: تم نشر التبرع بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharityDonation'
 *       400:
 *         description: البيانات المقدمة غير صالحة أو ناقصة.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       500:
 *         description: خطأ في الخادم أثناء تسجيل التبرع.
 */
router.post("/charity/post", verifyFirebase, postDonation);

/**
 * @swagger
 * /charity/mine:
 *   get:
 *     summary: جلب جميع التبرعات الخاصة بي
 *     description: يعرض للمستخدم المصادق عليه (Firebase) قائمة التبرعات التي قام بنشرها مسبقًا.
 *     tags: [CharityV10]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة التبرعات الخاصة بالمستخدم بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CharityDonation'
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       500:
 *         description: خطأ في الخادم أثناء جلب التبرعات.
 */
router.get("/charity/mine", verifyFirebase, getMyDonations);

/**
 * @swagger
 * /charity/unassigned:
 *   get:
 *     summary: جلب التبرعات غير المخصصة
 *     description: يعرض للمستخدم المصادق عليه (Firebase) قائمة التبرعات التي لم يتم تعيينها لأي منظمة بعد.
 *     tags: [CharityV10]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة التبرعات غير المخصصة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CharityDonation'
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       500:
 *         description: خطأ في الخادم أثناء جلب التبرعات.
 */
router.get("/charity/unassigned", verifyFirebase, getUnassignedDonations);

/**
 * @swagger
 * /charity/assign:
 *   patch:
 *     summary: تعيين تبرع إلى منظمة
 *     description: يسمح للمستخدم المصادق عليه (Firebase) بتعيين تبرع غير مخصص إلى منظمة محددة.
 *     tags: [CharityV10]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: معرِّف التبرع ومعرِّف المنظمة التي سيُسند إليها التبرع
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               donationId:
 *                 type: string
 *                 example: "donation123"
 *                 description: معرّف التبرع المراد تعيينه
 *               organizationId:
 *                 type: string
 *                 example: "org456"
 *                 description: معرّف المنظمة التي ستستلم التبرع
 *             required:
 *               - donationId
 *               - organizationId
 *     responses:
 *       200:
 *         description: تم تعيين التبرع إلى المنظمة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharityDonation'
 *       400:
 *         description: البيانات المقدمة غير صالحة أو التبرع/المنظمة غير موجود.
 *       401:
 *         description: توكين غير صالح أو منتهي الصلاحية.
 *       404:
 *         description: لم يتم العثور على التبرع أو المنظمة المحددة.
 *       500:
 *         description: خطأ في الخادم أثناء تعيين التبرع.
 */
router.patch("/charity/assign", verifyFirebase, assignToOrganization);

export default router;
