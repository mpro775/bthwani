// src/routes/haraj_v2/adminProductRoutes.ts

import { Router } from "express";
import {
  adminGetAllProducts,
  adminUpdateProduct,
} from "../../controllers/Haraj_V2/adminProductController";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { verifyAdmin } from "../../middleware/verifyAdmin";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: HarajAdminProducts
 *     description: إدارة منتجات Haraj من قِبَل الأدمن
 */

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: جلب جميع منتجات Haraj (للأدمن)
 *     description: يتيح للأدمن المصادق عليه (Firebase + صلاحية Admin) عرض قائمة بكل المنتجات في قسم Haraj؛ يشمل ذلك المنتجات المعلقة أو المنشورة.
 *     tags: [HarajAdminProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة المنتجات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HarajProduct'
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المنتجات.
 */
router.get("/", verifyFirebase, verifyAdmin, adminGetAllProducts);

/**
 * @swagger
 * /admin/products/{id}:
 *   patch:
 *     summary: تحديث بيانات منتج Haraj بواسطة المعرف
 *     description: يتيح للأدمن المصادق عليه (Firebase + صلاحية Admin) تعديل خصائص منتج Haraj قائمة عبر معرّف المنتج.
 *     tags: [HarajAdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف المنتج المراد تحديثه
 *     requestBody:
 *       description: الحقول المراد تعديلها في المنتج (مثل العنوان، الوصف، السعر، الحالة، إلخ).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "هاتف آيفون X"
 *                 description: عنوان المنتج الجديد
 *               description:
 *                 type: string
 *                 example: "منتج جديد كليًا، لم يُستخدم"
 *                 description: وصف مُحدّث للمنتج
 *               price:
 *                 type: number
 *                 example: 2500.0
 *                 description: سعر منتج مُحدّث
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, banned]
 *                 example: "approved"
 *                 description: الحالة الجديدة للمنتج
 *               categoryId:
 *                 type: string
 *                 example: "cat123"
 *                 description: معرّف فئة المنتج إذا تم تغييره
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث المنتج بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HarajProduct'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث المنتج.
 */
router.patch("/:id", verifyFirebase, verifyAdmin, adminUpdateProduct);

export default router;
