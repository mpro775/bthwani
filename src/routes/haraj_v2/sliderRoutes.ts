// src/routes/haraj_v2/sliderRoutes.ts

import { Router } from "express";
import {
  getSliders,
  createSlider,
} from "../../controllers/Haraj_V2/bannerControllers";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { verifyAdmin } from "../../middleware/verifyAdmin";
import multer from "multer";

const upload = multer({ dest: "temp/" });
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: HarajSliders
 *     description: إدارة شرائح العرض (Sliders) في قسم Haraj
 */

/**
 * @swagger
 * /haraj/sliders:
 *   get:
 *     summary: جلب جميع شرائح العرض
 *     description: يعرض قائمة بكل شرائح العرض المُنشأة في النظام.
 *     tags: [HarajSliders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة شرائح العرض بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sliderId:
 *                     type: string
 *                     example: "slider456"
 *                   imageUrl:
 *                     type: string
 *                     format: url
 *                     example: "https://example.com/slider1.jpg"
 *                   link:
 *                     type: string
 *                     example: "https://example.com"
 *                   createdBy:
 *                     type: string
 *                     example: "64a0f2c7ae3c8b39f9d4d3e1"
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       500:
 *         description: خطأ في الخادم أثناء جلب شرائح العرض.
 */
router.get("/", getSliders);

/**
 * @swagger
 * /haraj/sliders:
 *   post:
 *     summary: إنشاء شريحة عرض جديدة
 *     description: يتيح للأدمن المصادق عليه (Firebase + صلاحية Admin) إنشاء شريحة عرض جديدة مع صورة ورابط.
 *     tags: [HarajSliders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: بيانات شريحة العرض الجديدة (ملف الصورة والرابط المرتبط).
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: ملف الصورة الذي سيتم عرضه في الشريحة.
 *               link:
 *                 type: string
 *                 format: url
 *                 example: "https://example.com"
 *                 description: الرابط الذي سينتقل إليه المستخدم عند النقر على الشريحة.
 *             required:
 *               - image
 *               - link
 *     responses:
 *       201:
 *         description: تم إنشاء شريحة العرض بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sliderId:
 *                   type: string
 *                   example: "slider789"
 *                 imageUrl:
 *                   type: string
 *                   format: url
 *                   example: "https://cdn.example.com/sliders/slider789.jpg"
 *                 link:
 *                   type: string
 *                   example: "https://example.com"
 *                 createdBy:
 *                   type: string
 *                   example: "64a0f2c7ae3c8b39f9d4d3e1"
 *       400:
 *         description: البيانات المقدمة غير صالحة (مثلاً: نوع ملف غير مدعوم أو رابط مفقود).
 *       401:
 *         description: توكين غير صالح أو مفقود.
 *       403:
 *         description: صلاحيات الأدمن فقط يمكنها الوصول.
 *       500:
 *         description: خطأ في الخادم أثناء إنشاء شريحة العرض.
 */
router.post("/", verifyFirebase, verifyAdmin, upload.single("image"), createSlider);

export default router;
