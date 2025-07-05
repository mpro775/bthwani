import { Schema, model, Document, Types } from 'mongoose';

export interface IAgentTransaction extends Document {
  agentId: Types.ObjectId;
  orderId?: Types.ObjectId;
  amount: number;
  type: 'deduct' | 'reset';
  createdAt: Date;
}

const agentTransactionSchema = new Schema<IAgentTransaction>({
  agentId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'DeliveryOrder' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deduct', 'reset'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IAgentTransaction>('AgentTransaction', agentTransactionSchema);
