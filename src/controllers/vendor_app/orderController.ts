// controllers/vendor/orderController.ts
import { Request, Response } from 'express';
import OrderVendor from '../../models/vendor_app/OrderVendor';

export const getVendorOrders = async (req: any, res: Response) => {
  const orders = await OrderVendor.find({ storeId: req.vendor.storeId });
  res.json(orders);
};

export const updateOrderStatus = async (req: any, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['preparing', 'rejected'].includes(status)) {
res.status(400).json({ error: 'Invalid status' });
    return;
  } 

  const order = await OrderVendor.findOneAndUpdate(
    { _id: id, storeId: req.vendor.storeId },
    { status },
    { new: true }
  );

  if (!order) {
 res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
};