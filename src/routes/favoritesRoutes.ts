// src/routes/favoritesRoutes.ts

import express from "express";
import { verifyFirebase } from "../middleware/verifyFirebase";
import {
  addFavorite,
  getFavoritesByUser,
  removeFavorite,
} from "../controllers/user/favoritesController";

const router = express.Router();

// جميع مسارات المفضلات تتطلب مصادقة Firebase/JWT
router.use(verifyFirebase);

/**
 * @swagger
 * tags:
 *   - name: Favorites
 *     description: إدارة قائمة المفضلات للمستخدم
 */

/**
 * @swagger
 * /users/favorites:
 *   post:
 *     summary: إضافة عنصر إلى المفضلات
 *     description: يضيف عنصرًا جديدًا (متجر، منتج، إلخ) إلى قائمة المفضلات الخاصة بالمستخدم.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: جسم الطلب يتضمن نوع العنصر ومعرّف العنصر
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemType:
 *                 type: string
 *                 description: نوع العنصر (مثلاً "store" أو "product")
 *                 example: "product"
 *               itemRefId:
 *                 type: string
 *                 description: معرّف العنصر في قاعدة البيانات
 *                 example: "prod789"
 *             required:
 *               - itemType
 *               - itemRefId
 *     responses:
 *       200:
 *         description: تم إضافة العنصر إلى المفضلات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 favorite:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       example: "item373839"
 *                     userId:
 *                       type: string
 *                       example: "64a0f2c7ae3c8b39f9d4d3e1"
 *                     itemType:
 *                       type: string
 *                       example: "product"
 *                     itemRefId:
 *                       type: string
 *                       example: "prod789"
 *       400:
 *         description: بيانات الطلب غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 */
router.post("/", addFavorite);

/**
 * @swagger
 * /users/favorites:
 *   delete:
 *     summary: إزالة عنصر من المفضلات
 *     description: يزيل عنصرًا (متجر، منتج، إلخ) من قائمة المفضلات الخاصة بالمستخدم.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: جسم الطلب يتضمن نوع العنصر ومعرّف العنصر المراد إزالته
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemType:
 *                 type: string
 *                 description: نوع العنصر (مثلاً "store" أو "product")
 *                 example: "product"
 *               itemRefId:
 *                 type: string
 *                 description: معرّف العنصر في قاعدة البيانات
 *                 example: "prod789"
 *             required:
 *               - itemType
 *               - itemRefId
 *     responses:
 *       200:
 *         description: تم إزالة العنصر من المفضلات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: بيانات الطلب غير صالحة.
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 *       404:
 *         description: العنصر غير موجود في قائمة المفضلات.
 */
router.delete("/", removeFavorite);

/**
 * @swagger
 * /users/favorites:
 *   get:
 *     summary: جلب قائمة المفضلات للمستخدم
 *     description: يُرجع جميع العناصر الموجودة في قائمة المفضلات الخاصة بالمستخدم المصادق عليه.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة المفضلات بنجاح.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemId:
 *                     type: string
 *                     example: "item373839"
 *                   userId:
 *                     type: string
 *                     example: "64a0f2c7ae3c8b39f9d4d3e1"
 *                   itemType:
 *                     type: string
 *                     example: "product"
 *                   itemRefId:
 *                     type: string
 *                     example: "prod789"
 *       401:
 *         description: لم يتم تقديم توكين صالح أو انتهت صلاحيته.
 */
router.get("/", getFavoritesByUser);

export default router;
