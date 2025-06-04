// src/routes/haraj_v2/categoryRoutes.ts

import { NextFunction, Response, Router, Request } from "express";
import {
  createCategory,
  deleteCategory,
  getNestedCategories,
  updateCategory,
  getCategoriesWithCounts,
} from "../../controllers/Haraj_V2/categoryController";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { verifyAdmin } from "../../middleware/verifyAdmin";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "temp/" });

/**
 * @swagger
 * tags:
 *   - name: HarajCategories
 *     description: إدارة فئات Haraj وإحصاءات المنتجات في كل فئة
 */

/**
 * @swagger
 * /haraj/categories:
 *   post:
 *     summary: إنشاء فئة جديدة
 *     description: يتيح للأدمن المصادق عليه (Firebase + صلاحية Admin) إنشاء فئة جديدة في قسم Haraj.
 *     tags: [HarajCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات الفئة الجديدة (مثل اسم الفئة، والوصف، ومعرِّف الفئة الأم إن وجدت، وصورة الفئة)
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "إلكترونيات"
 *                 description: اسم الفئة
 *               description:
 *                 type: string
 *                 example: "هواتف، حواسيب، إلكترونيات منزلية"
 *                 description: وصف مختصر للفئة
 *               parentId:
 *                 type: string
 *                 example: "catParent123"
 *                 description: معرِّف الفئة الأم (إن كان هناك تصنيف هرمي)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: صورة تمثيلية للفئة (اختياري)
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: تم إنشاء الفئة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: البيانات المقدمة غير صالحة (مثلاً: الاسم مفقود أو نوع الملف غير مدعوم).
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء الفئة.
 */
router.post("/", verifyFirebase, verifyAdmin, upload.single("image"), createCategory);

/**
 * @swagger
 * /haraj/categories:
 *   get:
 *     summary: جلب جميع الفئات مع عدد المنتجات في كل فئة
 *     description: يعرض قائمة بجميع الفئات المسجلة في النظام، مع إحصائية عدد المنتجات المرتبطة بكل فئة.
 *     tags: [HarajCategories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة الفئات مع الإحصاءات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   categoryId:
 *                     type: string
 *                     example: "cat123"
 *                     description: معرِّف الفئة
 *                   name:
 *                     type: string
 *                     example: "إلكترونيات"
 *                     description: اسم الفئة
 *                   productCount:
 *                     type: integer
 *                     example: 42
 *                     description: عدد المنتجات المرتبطة بهذه الفئة
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب الفئات والإحصاءات.
 */
router.get("/", getCategoriesWithCounts);

/**
 * @swagger
 * /haraj/categories/{id}:
 *   patch:
 *     summary: تحديث بيانات فئة بواسطة المعرِّف
 *     description: يتيح للأدمن المصادق عليه (Firebase + صلاحية Admin) تعديل بيانات فئة موجودة بناءً على معرِّفها.
 *     tags: [HarajCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف الفئة المراد تحديثها
 *     requestBody:
 *       description: الحقول المراد تعديلها في الفئة (مثل الاسم، الوصف، وصورة الفئة الجديدة).
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "إلكترونيات وأجهزة"
 *                 description: الاسم المُحدَّث للفئة
 *               description:
 *                 type: string
 *                 example: "هواتف، حواسيب، إلكترونيات ذكية"
 *                 description: الوصف المُحدَّث للفئة
 *               parentId:
 *                 type: string
 *                 example: "catParent456"
 *                 description: معرِّف الفئة الأم المُحدَّث (إن كان الترتيب الهرمي تغير)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: صورة جديدة للفئة (اختياري)
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: تم تحديث الفئة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: البيانات المقدمة غير صالحة (مثلاً: الاسم مفقود أو نوع الملف غير مدعوم).
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على الفئة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث الفئة.
 */
router.patch("/:id", verifyFirebase, verifyAdmin, upload.single("image"), updateCategory);

/**
 * @swagger
 * /haraj/categories/{id}:
 *   delete:
 *     summary: حذف فئة بواسطة المعرِّف
 *     description: يسمح للأدمن المصادق عليه (Firebase + صلاحية Admin) بحذف فئة من النظام بناءً على معرِّفها.
 *     tags: [HarajCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف الفئة المراد حذفها
 *     responses:
 *       200:
 *         description: تم حذف الفئة بنجاح.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على الفئة المطلوبة.
 *       500:
 *         description: خطأ في الخادم أثناء حذف الفئة.
 */
router.delete("/:id", verifyFirebase, verifyAdmin, deleteCategory);

/**
 * @swagger
 * /haraj/categories/nested:
 *   get:
 *     summary: جلب الفئات بشكل هرمي (Nested)
 *     description: يعرض شجرة الفئات كاملةً، بحيث تكون الفئات الفرعية مضمّنة تحت الفئات الأم.
 *     tags: [HarajCategories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب شجرة الفئات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   categoryId:
 *                     type: string
 *                     example: "cat123"
 *                     description: معرِّف الفئة
 *                   name:
 *                     type: string
 *                     example: "إلكترونيات"
 *                     description: اسم الفئة
 *                   children:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/NestedCategory'
 *                     description: الفئات الفرعية ضمن هذه الفئة
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب شجرة الفئات.
 */
router.get("/nested", getNestedCategories);

export default router;
