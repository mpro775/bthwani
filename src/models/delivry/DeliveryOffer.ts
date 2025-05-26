import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryOffer extends Document {
  title: string;
  type: 'product' | 'store' | 'category';
  value: number;
  valueType: 'percentage' | 'fixed';
  productId?: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

const offerSchema = new Schema<IDeliveryOffer>({
  title: { type: String, required: true },
  type: { type: String, enum: ['product', 'store', 'category'], required: true },
  value: { type: Number, required: true },
  valueType: { type: String, enum: ['percentage', 'fixed'], required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryProduct' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryStore' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryCategory' },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IDeliveryOffer>('DeliveryOffer', offerSchema);
