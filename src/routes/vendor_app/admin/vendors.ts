// src/routes/admin/vendorAdminRoutes.ts

import express from "express";
import { addVendor } from "../../../controllers/admin/vendorController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AdminVendors
 *     description: إدارة بيانات التجار من قِبَل الأدمن
 */

/**
 * @swagger
 * /admin/vendors:
 *   post:
 *     summary: إضافة تاجر جديد
 *     description: يتيح للأدمن المصادق عليه إنشاء سجل تاجر جديد في النظام.
 *     tags: [AdminVendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات التاجر المراد إضافته
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "مطعم البيتزا السريع"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "vendor@example.com"
 *               phone:
 *                 type: string
 *                 example: "+966501234567"
 *               address:
 *                 type: string
 *                 example: "الرياض، حي الرمال"
 *             required:
 *               - name
 *               - email
 *               - phone
 *     responses:
 *       201:
 *         description: تم إنشاء التاجر بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: البيانات المقدمة غير صالحة أو تنسيق خاطئ.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء التاجر.
 */
router.post("/", addVendor);

export default router;
