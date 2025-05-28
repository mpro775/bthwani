import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: string;
  itemId: string;
  itemType: 'product' | 'store' | 'freelancer' | 'opportunity' | 'blood' | 'lostItem' | 'foundItem';
  createdAt: Date;
}

const favoriteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: String, required: true },
    itemType: {
      type: String,
      enum: ['product', 'store', 'freelancer', 'opportunity', 'blood', 'lostItem', 'foundItem'],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);
