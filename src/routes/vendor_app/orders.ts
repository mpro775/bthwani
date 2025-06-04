// src/routes/vendor/orderAdminRoutes.ts

import express from "express";
import {
  getVendorOrders,
  updateOrderStatus,
} from "../../controllers/vendor_app/orderController";
import { authVendor } from "../../middleware/authVendor";

const router = express.Router();

// جميع مسارات VendorApp تتطلب مصادقة البائع
router.use(authVendor);

/**
 * @swagger
 * tags:
 *   - name: VendorOrders
 *     description: إدارة طلبات التطبيق الخاص بالتاجر
 */

/**
 * @swagger
 * /vendor/orders:
 *   get:
 *     summary: جلب جميع الطلبات الخاصة بالتاجر المصادق عليه
 *     description: يعرض للتاجر قائمة بجميع الطلبات الواردة إلى متجره.
 *     tags: [VendorOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب الطلبات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorOrder'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات التاجر فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الطلبات.
 */
router.get("/", getVendorOrders);

/**
 * @swagger
 * /vendor/orders/{id}/status:
 *   patch:
 *     summary: تحديث حالة طلب معين
 *     description: يتيح للتاجر المصادق عليه تعديل حالة الطلب (مثل معلق، قيد التنفيذ، مكتمل، ملغي).
 *     tags: [VendorOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الطلب المراد تحديث حالته
 *     requestBody:
 *       description: بيانات تغيير الحالة (الحالة الجديدة وملاحظة إن وجدت)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *                 example: "processing"
 *                 description: الحالة الجديدة للطلب
 *               note:
 *                 type: string
 *                 example: "سيتم التوصيل خلال ساعة"
 *                 description: ملاحظة إضافية عن تحديث الحالة
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث حالة الطلب بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorOrder'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات التاجر فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على الطلب المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث حالة الطلب.
 */
router.patch("/:id/status", updateOrderStatus);

export default router;
