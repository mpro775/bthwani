import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoiceBook extends Document {
  bookNumber: number;
  startNumber: number;
  endNumber: number;
  assignedTo?: Types.ObjectId | null;
  status: 'active' | 'released';
}

const invoiceBookSchema = new Schema<IInvoiceBook>({
  bookNumber: { type: Number, required: true, unique: true },
  startNumber: { type: Number, default: 1 },
  endNumber: { type: Number, default: 25 },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
  status: { type: String, enum: ['active', 'released'], default: 'active' },
}, { timestamps: true });

export default model<IInvoiceBook>('InvoiceBook', invoiceBookSchema);
