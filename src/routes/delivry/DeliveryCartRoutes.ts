// src/routes/deliveryCart.routes.ts
import express from 'express';
import * as controller from '../../controllers/delivry/DeliveryCartController';
import { verifyFirebase } from '../../middleware/verifyFirebase';
const router = express.Router();


// GET /cart/:cartId   أو  /cart/user/:userId
router.get('/user/:userId', controller.getCart);
router.get('/:cartId', controller.getCart);

// POST /cart/add
router.post('/add', controller.addToCart);



// DELETE ...
router.delete('/user/:userId', controller.clearCart);
router.delete('/:cartId', controller.clearCart);

// في deliveryCart.routes.ts
router.delete('/:cartId/items/:productId', controller.removeItem);
router.delete('/user/:userId/items/:productId', controller.removeItem);

// باقي المسارات
router.get('/', controller.getAllCarts);
router.get('/abandoned', controller.getAbandonedCarts);
router.post('/merge', verifyFirebase, controller.mergeCart);

export default router;
