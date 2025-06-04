// src/routes/job_v3/reviewRoutes.ts

import express from "express";
import {
  flagReview,
  getFreelancerReviews,
  submitReview,
} from "../../controllers/job_V3/reviewController";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: JobReview
 *     description: إدارة تقييمات المستقلين والطلبات
 */

/**
 * @swagger
 * /job/review/{freelancerId}:
 *   post:
 *     summary: إرسال تقييم لمستقل
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تقديم تقييم لمستقل محدد بواسطة معرفه.
 *     tags: [JobReview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: freelancerId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف المستقل المراد تقييمه
 *     requestBody:
 *       description: بيانات التقييم (التقييم والنص)
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
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: المستقل أو الطلب غير موجود.
 *       500:
 *         description: خطأ في الخادم أثناء معالجة التقييم.
 */
router.post("/:freelancerId", verifyFirebase, submitReview);

/**
 * @swagger
 * /job/review/{freelancerId}:
 *   get:
 *     summary: جلب تقييمات مستقل
 *     description: يعرض جميع التقييمات المقدمة لمستقل محدد بواسطة معرّفه.
 *     tags: [JobReview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: freelancerId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف المستقل المراد جلب تقييماته
 *     responses:
 *       200:
 *         description: تم جلب تقييمات المستقل بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: المستقل غير موجود.
 *       500:
 *         description: خطأ في الخادم أثناء جلب التقييمات.
 */
router.get("/:freelancerId", getFreelancerReviews);

/**
 * @swagger
 * /job/review/{id}/flag:
 *   patch:
 *     summary: الإبلاغ عن تقييم
 *     description: يتيح للمستخدم المصادق عليه (Firebase) الإبلاغ عن تقييم محدد لأي سبب (مثلاً: مسيء أو غير لائق).
 *     tags: [JobReview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف التقييم المراد الإبلاغ عنه
 *     responses:
 *       200:
 *         description: تم الإبلاغ عن التقييم بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم الإبلاغ عن التقييم."
 *       400:
 *         description: معرّف غير صالح أو التقييم لا يمكن الإبلاغ عنه.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على التقييم المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء معالجة الإبلاغ.
 */
router.patch("/:id/flag", verifyFirebase, flagReview);

export default router;
