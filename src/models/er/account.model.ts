import { Schema, model, Document } from 'mongoose';

export interface IAccount extends Document {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  isActive: boolean;
}

const AccountSchema = new Schema<IAccount>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    required: true,
  },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Account = model<IAccount>('Account', AccountSchema);

