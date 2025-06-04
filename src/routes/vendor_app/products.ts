// src/routes/vendor/productAdminRoutes.ts

import express from "express";
import { createProduct } from "../../controllers/vendor_app/productController";
import { authVendor } from "../../middleware/authVendor";

const router = express.Router();

// جميع مسارات VendorApp تتطلب مصادقة البائع
router.use(authVendor);

/**
 * @swagger
 * tags:
 *   - name: VendorProducts
 *     description: إدارة منتجات التطبيق الخاص بالتاجر
 */

/**
 * @swagger
 * /vendor/products:
 *   post:
 *     summary: إضافة منتج جديد للتاجر
 *     description: يتيح للتاجر المصادق عليه إنشاء منتج جديد في متجره.
 *     tags: [VendorProducts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات المنتج المراد إنشاؤه (مثل الاسم، الوصف، السعر، وغيرها)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "هاتف ذكي جديد"
 *                 description: اسم المنتج
 *               description:
 *                 type: string
 *                 example: "هاتف ذكي بمواصفات عالية وكاميرا مزدوجة"
 *                 description: وصف تفصيلي للمنتج
 *               price:
 *                 type: number
 *                 example: 1200.50
 *                 description: سعر المنتج
 *               categoryId:
 *                 type: string
 *                 example: "cat789"
 *                 description: معرّف فئة المنتج
 *               stock:
 *                 type: integer
 *                 example: 30
 *                 description: كمية المخزون المتوفر
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: url
 *                 example:
 *                   - "https://cdn.example.com/vendor/123/image1.jpg"
 *                   - "https://cdn.example.com/vendor/123/image2.jpg"
 *                 description: قائمة روابط صور المنتج
 *             required:
 *               - title
 *               - price
 *               - categoryId
 *     responses:
 *       201:
 *         description: تم إنشاء المنتج بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProduct'
 *       400:
 *         description: البيانات المقدمة غير صالحة أو ناقصة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات التاجر فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء المنتج.
 */
router.post("/", createProduct);

export default router;
