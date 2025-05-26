import express from 'express';
import * as controller from '../../controllers/delivry/DeliveryBannerController';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import { verifyFirebase } from '../../middleware/verifyFirebase';

const router = express.Router();

router.post('/',verifyFirebase, verifyAdmin, controller.create);
router.get('/',  controller.getAll);
router.get('/:id', verifyFirebase,verifyAdmin, controller.getById);
router.put('/:id', verifyFirebase,verifyAdmin, controller.update);
router.delete('/:id', verifyFirebase,verifyAdmin, controller.remove);

export default router;
