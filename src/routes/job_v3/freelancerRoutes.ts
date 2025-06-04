// src/routes/job_v3/freelancerRoutes.ts

import express from "express";
import { getAvailability } from "../../controllers/job_V3/freelancerController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: JobFreelancers
 *     description: إدارة بيانات المستقلين (Freelancers)
 */

/**
 * @swagger
 * /job/freelancers/{id}/availability:
 *   get:
 *     summary: جلب مدى توافُر المستقل بواسطة المعرف
 *     description: يتيح الاطّلاع على مدى توافر مستقل معيّن للعمل في الفترات المحددة.
 *     tags: [JobFreelancers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف المستقل المراد جلب مدى توافره
 *     responses:
 *       200:
 *         description: تم جلب مدى التوافر بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 freelancerId:
 *                   type: string
 *                   example: "free789"
 *                   description: معرّف المستقل
 *                 availability:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-07-01"
 *                         description: التاريخ المتاح للعمل
 *                       slots:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "09:00-12:00"
 *                         description: الفترات الزمنية المتاحة في ذلك التاريخ
 *       400:
 *         description: معرّف غير صالح أو طلب مفقود.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المستقل المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب مدى التوفر.
 */
router.get("/:id/availability", getAvailability);

export default router;
