// src/routes/deliveryMarketplaceV1/deliveryOrderRoutes.ts

import express, { NextFunction, Request, Response } from "express";
import * as controller from "../../controllers/delivry_Marketplace_V1/DeliveryOrderController";
import { verifyAdmin } from "../../middleware/verifyAdmin";
import { verifyAdminOrDriver } from "../../middleware/verifyAdminOrDriver";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { body, validationResult } from "express-validator";
import Order from "../../models/delivry_Marketplace_V1/Order";
import { requireRole } from "../../middleware/auth";

const router = express.Router();
router.use(verifyFirebase);

const createOrderValidators = [
  body("addressId").isMongoId().withMessage("Invalid addressId"),
  body("city").optional().isString(),
  body("latitude").optional().isNumeric(),
  body("longitude").optional().isNumeric(),
];

/**
 * @swagger
 * tags:
 *   - name: DeliveryOrders
 *     description: إدارة طلبات سوق التوصيل V1
 */

/**
 * @swagger
 * /delivery/orders:
 *   post:
 *     summary: Create a new delivery order
 *     description: Create a new order in the delivery marketplace. Validates addressId and optional location fields.
 *     tags: [DeliveryOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Order payload including addressId and optional city/coordinates.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressId:
 *                 type: string
 *                 format: mongoId
 *                 example: "60d21b4667d0d8992e610c85"
 *                 description: ID of the delivery address
 *               city:
 *                 type: string
 *                 example: "Riyadh"
 *                 description: City name (optional, for backward compatibility)
 *               latitude:
 *                 type: number
 *                 example: 24.7136
 *                 description: Latitude coordinate (optional)
 *               longitude:
 *                 type: number
 *                 example: 46.6753
 *                 description: Longitude coordinate (optional)
 *             required:
 *               - addressId
 *     responses:
 *       201:
 *         description: The order was created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation errors or missing/invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid addressId"
 *                       param:
 *                         type: string
 *                         example: "addressId"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: Missing or invalid bearer token.
 *       500:
 *         description: Server error while creating order.
 */
router.post(
  "/",
  createOrderValidators,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },
  controller.createOrder
);

/**
 * @swagger
 * /delivery/orders/vendor/orders:
 *   get:
 *     summary: Retrieve orders for a vendor
 *     description: Fetch all orders containing subOrders assigned to the authenticated vendor. Vendor role required.
 *     tags: [DeliveryOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders for the vendor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Vendor role required.
 *       500:
 *         description: Server error while fetching vendor orders.
 */
router.get(
  "/vendor/orders",
  requireRole(["vendor"]),
  async (req: Request, res: Response) => {
    try {
      const vendorId = req.user.id;
      const orders = await Order.find({ "subOrders.storeId": vendorId });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

/**
 * @swagger
 * /delivery/orders/user/{userId}:
 *   get:
 *     summary: Retrieve orders by user ID
 *     description: Fetch all orders placed by a specific user.
 *     tags: [DeliveryOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: User ID whose orders are to be retrieved.
 *     responses:
 *       200:
 *         description: List of orders for the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid userId.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: No orders found for the user.
 *       500:
 *         description: Server error while fetching user orders.
 */
router.get("/user/:userId", controller.getUserOrders);

/**
 * @swagger
 * /delivery/orders/{id}:
 *   get:
 *     summary: Retrieve order by ID
 *     description: Fetch a single order by its ID.
 *     tags: [DeliveryOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: Order ID to retrieve.
 *     responses:
 *       200:
 *         description: Order details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Server error while fetching order.
 */
router.get("/:id", controller.getOrderById);

/**
 * @swagger
 * /delivery/orders:
 *   get:
 *     summary: Retrieve all orders (Admin)
 *     description: Fetch all orders in the system. Admin role required.
 *     tags: [DeliveryOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Admin role required.
 *       500:
 *         description: Server error while fetching orders.
 */
router.get("/", verifyAdmin, controller.getAllOrders);

/**
 * @swagger
 * /delivery/orders/{id}:
 *   put:
 *     summary: Update order status by ID
 *     description: Allows Admin or assigned Driver to update the status of an order.
 *     tags: [DeliveryOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: Order ID to update.
 *     requestBody:
 *       description: New status for the order.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, in_progress, completed, cancelled]
 *                 example: "in_progress"
 *                 description: New status value.
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Order status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID or status value.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Admin or Driver role required.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Server error while updating order.
 */
router.put("/:id", verifyAdminOrDriver, controller.updateOrderStatus);

export default router;
