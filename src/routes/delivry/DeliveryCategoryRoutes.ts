import express from 'express';
import * as controller from '../../controllers/delivry/DeliveryCategoryController';
import { verifyAdmin } from '../../middleware/verifyAdmin'; // ✅ استدعاء الحماية
import { verifyFirebase } from '../../middleware/verifyFirebase';

const router = express.Router();

// 🛡️ حماية جميع العمليات خلف التوكن الإداري
router.post('/', verifyFirebase,verifyAdmin,  controller.create);
router.put('/:id', verifyFirebase,verifyAdmin,  controller.update);
router.get('/',  controller.getAll);
router.get('/:id',verifyFirebase, verifyAdmin, controller.getById);
router.delete('/:id',verifyFirebase, verifyAdmin, controller.remove);

export default router;
