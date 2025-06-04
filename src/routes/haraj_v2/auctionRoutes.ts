// src/routes/haraj_v2/auctionRoutes.ts

import express from "express";
import { placeBid } from "../../controllers/Haraj_V2/auctionController";
import { verifyFirebase } from "../../middleware/verifyFirebase";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: HarajAuctions
 *     description: إدارة المزايدات في قسم Haraj
 */

/**
 * @swagger
 * /haraj/auction/{id}/bid:
 *   post:
 *     summary: وضع مزايدة على منتج مزايدة
 *     description: يتيح للمستخدم المصادق عليه (Firebase) وضع مزايدة جديدة على منتج مزايدة معين بواسطة المعرّف.
 *     tags: [HarajAuctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف منتج المزايدة الذي سيتم وضع المزايدة عليه
 *     requestBody:
 *       description: بيانات المزايدة الجديدة (السعر المقترح، إلخ)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bidAmount:
 *                 type: number
 *                 example: 1500.0
 *                 description: المبلغ الذي يرغب المستخدم في المزايدة به
 *             required:
 *               - bidAmount
 *     responses:
 *       201:
 *         description: تم وضع المزايدة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bidId:
 *                   type: string
 *                   example: "bid789"
 *                   description: معرّف المزايدة التي تم إنشاؤها
 *                 productId:
 *                   type: string
 *                   example: "prod456"
 *                   description: معرّف المنتج الذي وُضعت المزايدة عليه
 *                 userId:
 *                   type: string
 *                   example: "64a0f2c7ae3c8b39f9d4d3e1"
 *                   description: معرّف المستخدم الذي وضع المزايدة
 *                 bidAmount:
 *                   type: number
 *                   example: 1500.0
 *                   description: المبلغ النهائي للمزايدة
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-20T16:45:00Z"
 *                   description: تاريخ ووقت إنشاء المزايدة
 *       400:
 *         description: البيانات المقدمة غير صالحة (مثلاً، المبلغ أقل من الحد الأدنى المقبول).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: لم يتم العثور على منتج المزايدة المطلوب أو المزايدة انتهت بالفعل.
 *       500:
 *         description: خطأ في الخادم أثناء معالجة المزايدة.
 */
router.post("/:id/bid", verifyFirebase, placeBid);

export default router;
