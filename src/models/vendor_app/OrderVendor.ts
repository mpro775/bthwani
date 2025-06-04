import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  storeId: mongoose.Types.ObjectId;
  items: any[];
  status: string;
}

const OrderSchema: Schema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [Object],
  status: { type: String, enum: ['new', 'preparing', 'rejected', 'delivered'], default: 'new' }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);