import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryBanner extends Document {
  title?: string;
  description?: string;
  image: string;
  link?: string;
  storeId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  isActive: boolean;
  order?: number;
  startDate?: Date;
  endDate?: Date;
}

const bannerSchema = new Schema<IDeliveryBanner>({
  title: { type: String },
  description: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryStore' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryCategory' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IDeliveryBanner>('DeliveryBanner', bannerSchema);
