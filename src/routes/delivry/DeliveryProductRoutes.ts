import express from 'express';
import * as controller from '../../controllers/delivry/DeliveryProductController';
import { verifyAdmin } from '../../middleware/verifyAdmin'; // ✅ حماية الأدمن
import { verifyFirebase } from '../../middleware/verifyFirebase';

const router = express.Router();

// 🛡️ حماية كافة المسارات الخاصة بالمنتجات
router.post('/',verifyFirebase, verifyAdmin, controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id',verifyFirebase, verifyAdmin, controller.update);
router.delete('/:id',verifyFirebase, verifyAdmin, controller.remove);

export default router;
