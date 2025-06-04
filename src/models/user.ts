import mongoose, { Model, Types } from "mongoose";
import { UserType } from "../types/user.types";

// 🏠 عنوان المستخدم
const AddressSchema = new mongoose.Schema({
  label: String,
  street: String,
  city: String,

  location: {
    lat: Number,
    lng: Number,
  },
});

// 💰 محفظة المستخدم
const WalletSchema = new mongoose.Schema(
  {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "YER" },
    totalSpent: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 }, // ✅
    savings: { type: Number, default: 0 }, // ✅ الجديد

    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

// 🔐 إعدادات الأمان
const SecuritySchema = new mongoose.Schema(
  {
    pinCode: { type: String, default: null },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { _id: false }
);

// 💳 سجل المعاملات
const TransactionSchema = new mongoose.Schema(
  {
    amount: Number,
    type: { type: String, enum: ["credit", "debit"] },
    method: {
      type: String,
      enum: [
        "agent",
        "card",
        "transfer",
        "payment",
        "escrow",
        "reward",
        "kuraimi",
      ],
    }, // <-- أضف هذه
    description: String,
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

// 📘 سجل النشاطات
const ActivityLogSchema = new mongoose.Schema(
  {
    action: String,
    target: String, // post, product, message...
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  aliasName: { type: String },
  email: { type: String, unique: true },
  phone: { type: String },
  profileImage: { type: String, default: "" },
emailVerified: { type: Boolean, default: false },

  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },

  governorate: String,
  city: String,
  addresses: [AddressSchema],
defaultAddressId: {
  type: mongoose.Schema.Types.ObjectId,
  required: false,
},
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  authProvider: {
    type: String,
    enum: ["firebase", "local"],
    default: "firebase",
  },
  firebaseUID: String,
  subscription: {
    planId: String,
    startedAt: Date,
    nextBilling: Date,
  },
  postsCount: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
  messagesCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },

  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  loginHistory: [
    {
      ip: String,
      userAgent: String,
      at: { type: Date, default: Date.now },
    },
  ],
  notificationsFeed: [
    {
      title: { type: String, required: true },
      body: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed }, // للإرسال بيانات إضافية مثل orderId
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  // Lost & Found
  lostAndFoundPosts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LostItem" },
  ],
  lostStats: {
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },

  donationLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: undefined,
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
    updatedAt: Date,
  },

  // Blood Bank
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  isAvailableToDonate: { type: Boolean, default: false },
  bloodRequests: [
    { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },
  ],

  donationHistory: [
    {
      requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },
      date: { type: Date, default: Date.now },
      location: {
        lat: Number,
        lng: Number,
      },
    },
  ],

  // Freelancing & Jobs
  isFreelancer: { type: Boolean, default: false },
  freelancerProfile: {
    type: new mongoose.Schema(
      {
        service: { type: String, default: "" },
        bio: { type: String, default: "" },
        portfolioImages: { type: [String], default: [] },
        availability: {
          type: [
            {
              day: {
                type: String,
                enum: [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
              },
              start: String,
              end: String,
            },
          ],
          default: [],
        },

        bookings: [
          {
            userId: { type: Types.ObjectId, ref: "User" },
            date: Date,
            status: {
              type: String,
              enum: ["pending", "confirmed", "completed", "cancelled"],
              default: "pending",
            },
          },
        ],
        badges: {
          type: [String],
          default: [],
        },
        reviews: {
          type: [
            {
              userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
              rating: { type: Number, min: 1, max: 5 },
              comment: String,
              createdAt: { type: Date, default: Date.now },
              flagged: { type: Boolean, default: false },
            },
          ],
          default: [],
        },
      },
      { _id: false }
    ),
    default: () => ({}),
  },
  jobPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobOpportunity" }],

  // Bookings
  bookingPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  bookingStats: {
    views: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
  },

  // Settings
  language: { type: String, enum: ["ar", "en"], default: "ar" },
  theme: { type: String, enum: ["light", "dark"], default: "light" },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
  isBlacklisted: { type: Boolean, default: false },

  pushToken: { type: String },

  favoriteCategories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
  ],

  foundResolvedCount: {
    type: Number,
    default: 0,
  },
  badges: {
    type: [String],
    default: [],
  },

  // 💰 Wallet
  wallet: WalletSchema,

  // 🔐 Security
  security: { type: SecuritySchema, default: () => ({}) },

  // 💳 Transactions
  transactions: [TransactionSchema],
  // 📘 Activity Log
  activityLog: [ActivityLogSchema],
});
UserSchema.index({ donationLocation: "2dsphere" }, { sparse: true });

export interface UserDocument extends Document, UserType {
  donationLocation?: {
    type: "Point";
    coordinates: [number, number];
    updatedAt?: Date;
  };
}
export const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  UserSchema
);
