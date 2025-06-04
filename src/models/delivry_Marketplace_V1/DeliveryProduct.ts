import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  subCategoryId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isDailyOffer?: boolean;
  
}

const productSchema = new Schema<IDeliveryProduct>({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryStore', required: true },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryProductSubCategory' },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
    isDailyOffer: { type: Boolean, default: false },

  image: String,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IDeliveryProduct>('DeliveryProduct', productSchema);
