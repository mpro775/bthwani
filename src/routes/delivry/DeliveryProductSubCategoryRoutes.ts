import express from 'express';
import * as controller from '../../controllers/delivry/DeliveryProductSubCategoryController';
import { verifyAdmin } from '../../middleware/verifyAdmin'; // ✅ إضافة الحماية
import { verifyFirebase } from '../../middleware/verifyFirebase';

const router = express.Router();

// 🛡️ حماية جميع العمليات داخل هذا الراوتر
router.post('/',verifyFirebase, verifyAdmin, controller.create);
router.get('/',  controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id',verifyFirebase, verifyAdmin, controller.update);
router.delete('/:id',verifyFirebase, verifyAdmin, controller.remove);
router.get('/store/:storeId', controller.getByStore);

export default router;
