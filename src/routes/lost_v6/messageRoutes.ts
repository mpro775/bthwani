// src/routes/lost_v6/messageRoutes.ts

import express from "express";
import {
  sendMessage,
  getMessages,
} from "../../controllers/lost_v6/messageController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: LostFoundMessages
 *     description: إدارة الرسائل الخاصة بإعلانات المفقودات/الموجودات
 */

/**
 * @swagger
 * /lostfound/messages:
 *   post:
 *     summary: إرسال رسالة جديدة
 *     description: يتيح للمستخدم المصادق عليه إرسال رسالة خاصة مرتبطة بإعلان مفقود أو موجود.
 *     tags: [LostFoundMessages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات الرسالة التي سيتم إرسالها
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: معرّف الإعلان الذي تُرسل الرسالة إليه
 *                 example: "item123"
 *               content:
 *                 type: string
 *                 description: نص الرسالة
 *                 example: "هل ما زال هذا الإعلان متاحًا؟"
 *             required:
 *               - itemId
 *               - content
 *     responses:
 *       201:
 *         description: تم إرسال الرسالة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageId:
 *                   type: string
 *                   example: "msg456"
 *                 itemId:
 *                   type: string
 *                   example: "item123"
 *                 senderId:
 *                   type: string
 *                   example: "user789"
 *                 content:
 *                   type: string
 *                   example: "هل ما زال هذا الإعلان متاحًا؟"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-20T14:30:00Z"
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: الإعلان المرتبط غير موجود.
 *       500:
 *         description: خطأ في الخادم أثناء إرسال الرسالة.
 */
router.post("/", sendMessage);

/**
 * @swagger
 * /lostfound/messages/{itemId}:
 *   get:
 *     summary: جلب جميع الرسائل المرتبطة بإعلان معين
 *     description: يعرض قائمة الرسائل الخاصة بإعلان المفقودات/الموجودات باستخدام معرّف الإعلان.
 *     tags: [LostFoundMessages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الإعلان المطلوب جلب الرسائل الخاصة به
 *     responses:
 *       200:
 *         description: تم جلب الرسائل بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   messageId:
 *                     type: string
 *                     example: "msg456"
 *                   itemId:
 *                     type: string
 *                     example: "item123"
 *                   senderId:
 *                     type: string
 *                     example: "user789"
 *                   content:
 *                     type: string
 *                     example: "هل ما زال هذا الإعلان متاحًا؟"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-20T14:30:00Z"
 *       400:
 *         description: معرّف غير صالح.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       404:
 *         description: الإعلان أو الرسائل المرتبطة غير موجودة.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الرسائل.
 */
router.get("/:itemId", getMessages);

export default router;
