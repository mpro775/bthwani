import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryCategory extends Document {
  name: string;
image: { type: String }; // رابط الصورة أو اسم الملف
  description?: string;
}

const deliveryCategorySchema = new Schema<IDeliveryCategory>({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model<IDeliveryCategory>('DeliveryCategory', deliveryCategorySchema);
