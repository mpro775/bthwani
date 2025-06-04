// src/routes/job_v3/miscRoutes.ts

import express from "express";
import { getFAQs } from "../../controllers/job_V3/miscController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: JobMisc
 *     description: أسئلة وأجوبة ومتنوّعات أخرى في قسم الوظائف jobs
 */

/**
 * @swagger
 * /job/faqs:
 *   get:
 *     summary: جلب الأسئلة الشائعة (FAQs)
 *     description: يعرض قائمة بالأسئلة الشائعة المتعلقة بالخدمات والوظائف في النظام.
 *     tags: [JobMisc]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب الأسئلة الشائعة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                     example: "ما هي طريقة حجز خدمة؟"
 *                     description: نص السؤال الشائع
 *                   answer:
 *                     type: string
 *                     example: "يمكنك حجز خدمة عبر الضغط على زر 'حجز' واتباع التعليمات."
 *                     description: نص الإجابة على السؤال
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الأسئلة الشائعة.
 */
router.get("/faqs", getFAQs);

export default router;
