// src/routes/admin/productAdminRoutes.ts

import express from "express";
import {
  getPendingProducts,
  updateProductStatus,
} from "../../../controllers/admin/productController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AdminProducts
 *     description: عمليات إدارة المنتجات من قِبَل الأدمن
 */

/**
 * @swagger
 * /admin/products/pending:
 *   get:
 *     summary: جلب المنتجات المعلقة للمراجعة
 *     description: يعرض للأدمن قائمة بجميع المنتجات التي لم يتم الموافقة عليها بعد وجاهزة للمراجعة.
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة المنتجات المعلقة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المنتجات المعلقة.
 */
router.get("/pending", getPendingProducts);

/**
 * @swagger
 * /admin/products/{id}/status:
 *   patch:
 *     summary: تحديث حالة المنتج بواسطة معرّف
 *     description: يتيح للأدمن تعديل حالة المنتج (مثل الموافقة أو الرفض) بناءً على معرّف المنتج.
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف المنتج المراد تحديث حالته
 *     requestBody:
 *       description: بيانات تغيير الحالة (مثل الحالة الجديدة ورأي الأدمن).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending]
 *                 example: "approved"
 *                 description: الحالة الجديدة للمنتج
 *               reason:
 *                 type: string
 *                 example: "الصور غير واضحة"
 *                 description: سبب الرفض أو ملاحظة للمراجعة
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث حالة المنتج بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث حالة المنتج.
 */
router.patch("/:id/status", updateProductStatus);

export default router;
