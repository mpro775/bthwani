import express from 'express';
import * as controller from '../../controllers/delivry/DeliveryStoreController';
import { verifyAdmin } from '../../middleware/verifyAdmin'; // ✅ إضافة الحماية
import { verifyFirebase } from '../../middleware/verifyFirebase';

const router = express.Router();

// 🛡️ حماية كافة المسارات الخاصة بإدارة المتاجر
router.post(
  '/',
   verifyFirebase,
  verifyAdmin,
 
  controller.create
);

router.put(
  '/:id',
     verifyFirebase,

  verifyAdmin,
  controller.update
);
router.get('/',  controller.getAll);
router.get('/:id',  controller.getById);
router.put('/:id',    verifyFirebase,
verifyAdmin, controller.update);
router.delete('/:id',   verifyFirebase,
 verifyAdmin, controller.remove);

export default router;
