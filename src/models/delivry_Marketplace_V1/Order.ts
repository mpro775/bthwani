import mongoose, { Document, Schema, Types } from "mongoose";

interface IRating {
  company:      number;  // 1–5
  order:        number;  // 1–5
  driver:       number;  // 1–5
  comments?:    string;
  ratedAt:      Date;
}

export type OrderStatus =
  | "pending_confirmation"   // في انتظار تأكيد الطلب من الإدارة
  | "under_review"           // قيد المراجعة → تُعطى للدليفري
  | "awaiting_driver"        // في انتظار موافقة المندوب
  | "preparing"              // قيد التحضير (داخل المطعم/المتجر)
  | "out_for_delivery"       // في الطريق إليك (من الدليفري)
  | "delivered"              // تم التوصيل
  | "returned"               // الارجاع (من الأدمن)
  | "cancelled";             // الالغاء (من الأدمن)
interface IStatusHistoryEntry {
  status: string;
  changedAt: Date;
  changedBy: "admin" | "store" | "driver" | "customer";
}

  interface ISubOrder {
  store: Types.ObjectId;
  items: {
    product: Types.ObjectId;
    quantity: number;
    unitPrice: number;
  }[];
  driver?: Types.ObjectId;
    deliveryReceiptNumber?: string;    // رقم السند

  status: OrderStatus;
    statusHistory: IStatusHistoryEntry[];

}

export interface IDeliveryOrder extends Document {
  user: Types.ObjectId;
  driver?: Types.ObjectId;
  items: {
    product: Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  subOrders: ISubOrder[];
  price: number;
  deliveryFee:number;
  companyShare:number;
  platformShare:number;
    rating?: IRating;    // إضافة حقل اختياري للتقييم

  walletUsed:number;
  cashDue:number;
  statusHistory: IStatusHistoryEntry[];

  address: {
    label: string;
    street: string;
    city: string;
    location: { lat: number; lng: number };
  };
  deliveryMode: "unified" | "split";
  paymentMethod: "wallet" | "cod";
  paid: boolean;
  status: OrderStatus;
    returnReason?: string;      // سبب الارجاع/الإلغاء
  returnBy?: "admin" | "customer" | "driver" | "store";
  scheduledFor?: Date;
  assignedAt?: Date;
  candidateDrivers?: Types.ObjectId[];
    deliveryReceiptNumber?: string;    // رقم السند

  deliveredAt?: Date;
  notes?: string;
}

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status:    { type: String, required: true },
    changedAt: { type: Date,   required: true, default: Date.now },
    changedBy: {
      type: String,
      enum: ["admin", "store", "driver", "customer"],
      required: true
    },
  },
  { _id: false }
);
const ratingSchema = new Schema<IRating>(
  {
    company:   { type: Number, min: 1, max: 5, required: true },
    order:     { type: Number, min: 1, max: 5, required: true },
    driver:    { type: Number, min: 1, max: 5, required: true },
    comments:  { type: String },
    ratedAt:   { type: Date, default: Date.now },
  },
  { _id: false }
);
const orderSchema = new Schema<IDeliveryOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "Driver" },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "DeliveryProduct",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
      },
    ],
    subOrders: [
      {
        store: {
          type: Schema.Types.ObjectId,
          ref: "DeliveryStore",
          required: true,
        },
        items: [
          {
            product: {
              type: Schema.Types.ObjectId,
              ref: "DeliveryProduct",
              required: true,
            },
            quantity: Number,
            unitPrice: Number,
          },
        ],
        driver: { type: Schema.Types.ObjectId, ref: "Driver" },
       status: {
      type: String,
      enum: [
        "pending_confirmation",
        "under_review",
        "preparing",
        "out_for_delivery",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "pending_confirmation",
    },
statusHistory: {
      type: [statusHistorySchema],
      default: [{ status: "pending_confirmation", changedAt: new Date(), changedBy: "customer" }],
    },
    deliveryReceiptNumber: {
  type: String,
  required: function () { return this.status === "delivered"; }
},
    returnReason: { type: String },
    returnBy: {
      type: String,
      enum: ["admin", "customer", "driver", "store"],
    },
    },
    ],
    rating: {
      type: ratingSchema,
      default: null,
    },
    deliveryReceiptNumber: {
  type: String,
  required: function () { return this.status === "delivered"; }
},
    price: { type: Number, required: true },
    companyShare: { type: Number, required: true }, // جديد
platformShare:{ type: Number, required: true }, // جديد
deliveryFee: { type: Number, required: true },
walletUsed: { type: Number, default: 0 },      // ما خصمه من المحفظة
cashDue:    { type: Number, default: 0 },      // المبلغ المتبقي يدفع كاش
    address: {
      label: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    deliveryMode: {
      type: String,
      enum: ["unified", "split"],
      default: "split",
    },
    paymentMethod: { type: String, enum: ["wallet", "cod"], required: true },
    paid: { type: Boolean, default: false },
   status: {
      type: String,
      enum: [
        "pending_confirmation",
        "under_review",
        "preparing",
        "out_for_delivery",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "pending_confirmation",
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [{ status: "pending_confirmation", changedAt: new Date(), changedBy: "customer" }],
    },
    returnReason: { type: String },
    returnBy: {
      type: String,
      enum: ["admin", "customer", "driver", "store"],
    },
    scheduledFor: Date,
    candidateDrivers: [{ type: Schema.Types.ObjectId, ref: "Driver" }],
    notes: String,
  },
  { timestamps: true }
);

orderSchema.pre("findOneAndUpdate", function (next) {
  const u: any = this.getUpdate();
  if (u.status === "assigned") u.assignedAt = new Date();
  if (u.status === "delivered") u.deliveredAt = new Date();
  this.setUpdate(u);
  next();
});

export default mongoose.model<IDeliveryOrder>("DeliveryOrder", orderSchema);
