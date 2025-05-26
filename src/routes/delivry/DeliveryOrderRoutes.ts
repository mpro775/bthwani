import express, { NextFunction ,Request,Response} from 'express';
import * as controller from '../../controllers/delivry/DeliveryOrderController';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import { verifyAdminOrDriver } from '../../middleware/verifyAdminOrDriver';
import { verifyFirebase } from '../../middleware/verifyFirebase';
import { body, validationResult } from 'express-validator';

const createOrderValidators = [
  body('addressId').isMongoId(),
  body('city').optional(),      // للتوافق العكسي إن أردت
  body('latitude').optional(),  // لن تحتاجها بعد
  body('longitude').optional(), // لن تحتاجها بعد
];

const router = express.Router();
router.use(verifyFirebase); 
router.post(
  '/',
  createOrderValidators,
  async (req:Request,res:Response,next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
    next();
  },
  controller.createOrder
);
router.get('/user/:userId', controller.getUserOrders);
router.get('/:id', controller.getOrderById);
router.get('/', verifyAdmin, controller.getAllOrders); // للأدمن مع فلترة
router.put('/:id', verifyAdminOrDriver, controller.updateOrderStatus);

export default router;
