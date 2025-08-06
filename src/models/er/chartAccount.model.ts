import { Schema, model, Document, Types } from 'mongoose';

export interface IChartAccount extends Document {
  name: string;
  code: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent?: Types.ObjectId | null;
}

const ChartAccountSchema = new Schema<IChartAccount>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    required: true,
  },
  parent: { type: Schema.Types.ObjectId, ref: 'ChartAccount', default: null },
}, { timestamps: true });

export const ChartAccount = model<IChartAccount>('ChartAccount', ChartAccountSchema);
