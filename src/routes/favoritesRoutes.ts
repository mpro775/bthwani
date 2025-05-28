import express from 'express';
import { verifyFirebase } from '../middleware/verifyFirebase';
import { addFavorite, getFavoritesByUser, removeFavorite } from '../controllers/favoritesController';

const router = express.Router();

router.use(verifyFirebase); // ✅ مصادقة Firebase أو JWT

router.post('/', addFavorite);          // إضافة للمفضلة
router.delete('/', removeFavorite);     // حذف من المفضلة
router.get('/', getFavoritesByUser);    // جلب المفضلة حسب المستخدم

export default router;
