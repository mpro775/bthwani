// src/routes/haraj_v2/productRoutes.ts

import { Router, Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFilteredProducts,
  getActiveOffers,
  getSimilarProducts,
  toggleLikeProduct,
  addComment,
  adminUpdateStatus,
  reportProduct,
  requestBarter,
  getMyProducts,
  getProductBids,
  getProductAnalytics,
  getNearbyProducts,
} from "../../controllers/Haraj_V2/productController";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { verifyAdmin } from "../../middleware/verifyAdmin";
import { Product } from "../../models/Haraj_V2/Product";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: HarajV2
 *     description: إدارة منتجات Haraj وإجراءات ذات الصلة
 */

/**
 * @swagger
 * /haraj/products:
 *   post:
 *     summary: إنشاء منتج جديد
 *     description: يتيح للمستخدم المصادق عليه (Firebase) إنشاء منتج جديد في Haraj.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات المنتج الجديدة (العنوان، الوصف، السعر، الفئة، الحالة، إلخ).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "هاتف آيفون 12"
 *                 description: عنوان المنتج
 *               description:
 *                 type: string
 *                 example: "جديد غير مستخدم مع ضمان سنة"
 *                 description: وصف تفصيلي للمنتج
 *               price:
 *                 type: number
 *                 example: 3000.0
 *                 description: سعر المنتج بالريال
 *               categoryId:
 *                 type: string
 *                 example: "cat123"
 *                 description: معرِّف الفئة المرتبطة بالمنتج
 *               condition:
 *                 type: string
 *                 enum: [new, used]
 *                 example: "new"
 *                 description: حالة المنتج (جديد أو مستعمل)
 *             required:
 *               - title
 *               - price
 *               - categoryId
 *               - condition
 *     responses:
 *       201:
 *         description: تم إنشاء المنتج بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HarajProduct'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء المنتج.
 */
router.post("/products", verifyFirebase, createProduct);

/**
 * @swagger
 * /haraj/admin/products:
 *   get:
 *     summary: جلب جميع المنتجات (للأدمن)
 *     description: يتيح للأدمن المصادق عليه (Firebase + صلاحية Admin) عرض قائمة بكل المنتجات في Haraj.
 *     tags: [HarajV2]
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
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المنتجات.
 */
router.get("/products", getAllProducts);

/**
 * @swagger
 * /haraj/products/my-products:
 *   get:
 *     summary: جلب جميع منتجات المستخدم الحالية
 *     description: يعرض للمستخدم المصادق عليه (Firebase) قائمة بجميع المنتجات التي قام بإنشائها.
 *     tags: [HarajV2]
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
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب منتجات المستخدم.
 */
router.get("/products/my-products", verifyFirebase, getMyProducts);
/**
 * @swagger
 * /haraj/products/{id}:
 *   get:
 *     summary: جلب منتج حسب المعرف
 *     description: يعرض تفاصيل منتج محدد بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المطلوب جلبه
 *     responses:
 *       200:
 *         description: تم جلب تفاصيل المنتج بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HarajProduct'
 *       400:
 *         description: معرِّف غير صالح.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب تفاصيل المنتج.
 */
router.get("/products/:id", getProductById);

/**
 * @swagger
 * /haraj/products/{id}/bids:
 *   get:
 *     summary: جلب عروض المزايدة لمنتج
 *     description: يعرض جميع العروض (bids) المقدمة على منتج محدد بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المطلوب جلب عروض المزايدة الخاصة به
 *     responses:
 *       200:
 *         description: تم جلب عروض المزايدة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HarajBid'
 *       400:
 *         description: معرِّف غير صالح.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب عروض المزايدة.
 */
router.get("/products/:id/bids", getProductBids);

/**
 * @swagger
 * /haraj/products/{id}/analytics:
 *   get:
 *     summary: جلب تحليلات المنتج
 *     description: يعرض بيانات إحصائية متعلقة بمنتج محدد مثل عدد المشاهدات والمبيعات والعروض.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المطلوب جلب تحليلاته
 *     responses:
 *       200:
 *         description: تم جلب تحليلات المنتج بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HarajProductAnalytics'
 *       400:
 *         description: معرِّف غير صالح.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب تحليلات المنتج.
 */
router.get("/products/:id/analytics", getProductAnalytics);

/**
 * @swagger
 * /haraj/products/nearby:
 *   get:
 *     summary: جلب المنتجات القريبة جغرافيًا
 *     description: يعرض قائمة بالمنتجات الموجودة بالقرب من إحداثيات المستخدم الحالية (اعتمادًا على الموقع الجغرافي).
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: خط العرض لجلب المنتجات القريبة
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: خط الطول لجلب المنتجات القريبة
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           example: 5
 *         description: نصف القطر بالكيلومترات للبحث عن المنتجات القريبة (افتراضي 10 كم)
 *     responses:
 *       200:
 *         description: تم جلب المنتجات القريبة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HarajProduct'
 *       400:
 *         description: قواعد استعلام غير صالحة (مثلاً: lat أو lng مفقود).
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المنتجات القريبة.
 */
router.get("/products/nearby", getNearbyProducts);

/**
 * @swagger
 * /haraj/products/{id}:
 *   patch:
 *     summary: تحديث منتج بواسطة المعرف
 *     description: يتيح للمستخدم المصادق عليه (Firebase) تعديل بيانات منتج خاص به بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المراد تحديثه
 *     requestBody:
 *       description: الحقول المراد تعديلها في المنتج (مثل العنوان أو الوصف أو السعر أو الحالة).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "هاتف آيفون 12 - مُحدَّث"
 *                 description: العنوان الجديد للمنتج
 *               description:
 *                 type: string
 *                 example: "حالة ممتازة، مع ضمان"
 *                 description: الوصف المحدث للمنتج
 *               price:
 *                 type: number
 *                 example: 2800.0
 *                 description: السعر المحدث بالريال
 *               condition:
 *                 type: string
 *                 enum: [new, used]
 *                 example: "used"
 *                 description: حالة المنتج بعد التحديث
 *             required:
 *               - title
 *               - price
 *               - condition
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
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث المنتج.
 */
router.patch("/products/:id", verifyFirebase, updateProduct);

/**
 * @swagger
 * /haraj/products/{id}:
 *   delete:
 *     summary: حذف منتج بواسطة المعرف
 *     description: يتيح للمستخدم المصادق عليه (Firebase) حذف منتج خاص به بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المراد حذفه
 *     responses:
 *       200:
 *         description: تم حذف المنتج بنجاح.
 *       400:
 *         description: معرِّف غير صالح أو محاولة حذف غير مصرح بها.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء حذف المنتج.
 */
router.delete("/products/:id", verifyFirebase, deleteProduct);

/**
 * @swagger
 * /haraj/products/{id}/like:
 *   patch:
 *     summary: إضافة/حذف إعجاب لمنتج
 *     description: يتيح للمستخدم المصادق عليه (Firebase) وضع أو إزالة الإعجاب على منتج محدد بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المراد وضع/إزالة الإعجاب عليه
 *     responses:
 *       200:
 *         description: تمّ التحديث (الإعجاب أو الإزالة) بنجاح، مع إرجاع حالة الإعجاب الحالية.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   example: true
 *                   description: الحالة الحالية للإعجاب (true إذا أعجب المستخدم بالمنتج، false إذا أُزيل الإعجاب)
 *       400:
 *         description: معرِّف غير صالح.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث حالة الإعجاب.
 */
router.patch("/products/:id/like", verifyFirebase, toggleLikeProduct);

/**
 * @swagger
 * /haraj/products/{id}/comment:
 *   post:
 *     summary: إضافة تعليق لمنتج
 *     description: يتيح للمستخدم المصادق عليه (Firebase) إضافة تعليق على منتج محدد بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المراد إضافة تعليق له
 *     requestBody:
 *       description: نص التعليق المراد إضافته
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "هل السعر قابل للتفاوض؟"
 *                 description: نص التعليق
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: تم إضافة التعليق بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductComment'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء إضافة التعليق.
 */
router.post("/products/:id/comment", verifyFirebase, addComment);

/**
 * @swagger
 * /haraj/products/{id}/status:
 *   patch:
 *     summary: تحديث حالة منتج بواسطة الأدمن
 *     description: يتيح للأدمن المصادق عليه (Firebase + صلاحية Admin) تعديل حالة المنتج (مثل الموافقة أو الرفض) بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المراد تحديث حالته
 *     requestBody:
 *       description: بيانات الحالة الجديدة للمراجعة (مثل "approved" أو "rejected" مع سبب الرفض إن وُجد).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, banned]
 *                 example: "approved"
 *                 description: الحالة الجديدة للمنتج
 *               reason:
 *                 type: string
 *                 example: "المنتج يتوافق مع المعايير"
 *                 description: ملاحظة للأدمن توضح سبب التحديث
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: تم تحديث حالة المنتج بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HarajProduct'
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء تحديث الحالة.
 */
router.patch(
  "/products/:id/status",
  verifyFirebase,
  verifyAdmin,
  adminUpdateStatus
);



/**
 * @swagger
 * /haraj/products/{id}/report:
 *   post:
 *     summary: الإبلاغ عن منتج
 *     description: يتيح للمستخدم المصادق عليه (Firebase) الإبلاغ عن منتج غير قانوني أو مخالف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المراد الإبلاغ عنه
 *     requestBody:
 *       description: سبب الإبلاغ أو التفاصيل الإضافية
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "يحتوي على معلومات كاذبة"
 *                 description: سبب الإبلاغ
 *             required:
 *               - reason
 *     responses:
 *       201:
 *         description: تم إرسال الإبلاغ بنجاح.
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء إرسال الإبلاغ.
 */
router.post("/products/:id/report", verifyFirebase, reportProduct);

/**
 * @swagger
 * /haraj/products/{id}/barter:
 *   post:
 *     summary: طلب مقايضة منتج
 *     description: يتيح للمستخدم المصادق عليه (Firebase) إرسال طلب مقايضة لمنتج محدد بواسطة المعرف.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج المراد طلب المقايضة عليه
 *     requestBody:
 *       description: تفاصيل المقايضة (مثل معرِّف المنتج المراد مقايضته والمعلومات الإضافية).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offeredProductId:
 *                 type: string
 *                 example: "prod789"
 *                 description: معرِّف المنتج الذي يقدِّمه المستخدم للمقايضة
 *               message:
 *                 type: string
 *                 example: "يمكنني تقديم هذه الساعة مقابل الهاتف"
 *                 description: رسالة تشرح عرض المقايضة
 *             required:
 *               - offeredProductId
 *     responses:
 *       201:
 *         description: تم إرسال طلب المقايضة بنجاح.
 *       400:
 *         description: البيانات المقدمة غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب أو المنتج المعروض للمقايضة.
 *       500:
 *         description: خطأ في الخادم أثناء إرسال طلب المقايضة.
 */
router.post("/products/:id/barter", verifyFirebase, requestBarter);

/**
 * @swagger
 * /haraj/products:
 *   get:
 *     summary: جلب المنتجات مع دعم الفلترة
 *     description: يعرض قائمة المنتجات مع دعم الفلترة حسب الفئة أو الحالة أو وجود عرض (hasOffer).
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: معرِّف الفئة لتصفية المنتجات حسبها
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, used]
 *         description: تصفية المنتجات حسب الحالة (جديد أو مستعمل)
 *       - in: query
 *         name: hasOffer
 *         schema:
 *           type: boolean
 *         description: جلب المنتجات التي تحتوي على عروض خصم فقط
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: رقم الصفحة عند استخدام الترقيم (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *         description: عدد المنتجات في كل صفحة
 *     responses:
 *       200:
 *         description: تم جلب قائمة المنتجات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HarajProduct'
 *       400:
 *         description: فلاتر البحث غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المنتجات.
 */
router.get("/products", getFilteredProducts);

/**
 * @swagger
 * /haraj/products/active-offers:
 *   get:
 *     summary: جلب جميع المنتجات التي تحتوي على عروض نشطة
 *     description: يعرض قائمة المنتجات التي تحتوي حاليًا على عروض خصم فعالة.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة المنتجات التي بها عروض نشطة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HarajProduct'
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المنتجات بعروض نشطة.
 */
router.get("/products/active-offers", getActiveOffers);

/**
 * @swagger
 * /haraj/products/{id}/similar:
 *   get:
 *     summary: جلب منتجات مشابهة
 *     description: يعرض قائمة بالمنتجات المشابهة لمنتج محدد استنادًا إلى الفئة أو الكلمات المفتاحية.
 *     tags: [HarajV2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرِّف المنتج الذي سيتم جلب منتجات مشابهة له
 *     responses:
 *       200:
 *         description: تم جلب قائمة المنتجات المماثلة بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HarajProduct'
 *       400:
 *         description: معرِّف غير صالح.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: لم يتم العثور على المنتج المطلوب.
 *       500:
 *         description: خطأ في الخادم أثناء جلب المنتجات المماثلة.
 */
router.get("/products/:id/similar", getSimilarProducts);

router.get("/products/:id/comments", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
       res.status(404).json({ message: "Product not found" });
       return;
    }

    // تأكد أن التعليقات مخزنة في product.comments كمصفوفة
    res.json(product.comments || []);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving comments", error: err });
  }
});

export default router;
