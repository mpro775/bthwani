import { Schema, model, Document, Types } from 'mongoose';

interface SubOrder {
  _id: string;
  storeId: string;
  items: { productId: string; quantity: number; price: number }[];
  deliveryDriverId?: string;
  deliveryStatus?: "pending" | "delivered" | "on_the_way";
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  driverId?: Types.ObjectId;
  storeId?: Types.ObjectId;
  status: "pending" | "assigned" | "delivering" | "delivered" | "cancelled";
  items: {
    productId: Types.ObjectId;
    name:      string;
    quantity:  number;
    unitPrice: number;
  }[];
  subOrders: SubOrder[];

    price: number;
address: {
    label:   string;
    street:  string;
    city:    string;
    location:{
      lat: number;
      lng: number;
    }
  };
deliveryMode?: "unified" | "split";
    city: string;
  notes?: string;
  assignedAt?: Date;
  paymentMethod?:string;
  paid:boolean;
  deliveredAt?: Date;
    scheduledFor?: Date;

  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' }, // role === 'driver'
  storeId: { type: Schema.Types.ObjectId, ref: 'DeliveryStore' },
  status: {
    type: String,
    enum: ["pending", "assigned", "delivering", "delivered", "cancelled"],
    default: "pending"
  },
    paymentMethod: {
    type: String,
    enum: ['wallet', 'cod'],    // Cod = Cash On Delivery
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  },

scheduledFor: {
  type: Date,
  required: false,
},
deliveryMode: {
  type: String,
  enum: ["unified", "split"],
  default: "split",
},
subOrders: [
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: Number,
        price: Number,
      },
    ],
    deliveryStatus: { type: String, enum: ["pending", "on_the_way", "delivered"], default: "pending" },
    deliveryDriverId: { type: Schema.Types.ObjectId, ref: "User" },
  },
],


items: [{
  productId: { type: Schema.Types.ObjectId, ref: 'DeliveryProduct', required: true },
  name:      { type: String, required: true },
  quantity:  { type: Number, required: true },
  unitPrice: { type: Number, required: true }
}],
  price: { type: Number, required: true },
  address: {
    label:   { type: String, required: true },
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    location:{
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },  city: String,
  notes: String,
  assignedAt: Date,
  deliveredAt: Date
}, { timestamps: true });

orderSchema.pre('findOneAndUpdate', function(next) {
  const update: any = this.getUpdate();
  if (update.status === 'assigned') {
    update.assignedAt = new Date();
  }
  if (update.status === 'delivered') {
    update.deliveredAt = new Date();
  }
  this.setUpdate(update);
  next();
});

export default model<IOrder>('DeliveryOrder', orderSchema);
