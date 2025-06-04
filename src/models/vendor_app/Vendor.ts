import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
}

const VendorSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true }
});

export default mongoose.model<IVendor>('Vendor', VendorSchema);