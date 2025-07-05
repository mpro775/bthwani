
import { Request } from "express";

// types/user.types.ts
export interface Address {
    _id?: string; // ✅ اجعل الـ _id اختيارياً

  label?: string;
  location?: { lat: number; lng: number };
  street?: string;
  city?: string;
}


export interface Wallet {
  balance: number;
  currency: string;
  totalSpent: number;
  totalEarned: number;
  lastUpdated: Date;
  loyaltyPoints: number;
  savings: number;
}

export interface Security {
  pinCode: string | null;
  twoFactorEnabled: boolean;
}

export interface Transaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  method:string;
  date?:Date;
}

export interface ActivityLog {
  action: string;
  target: string;
at?: Date;
}


export interface NotificationFeed {
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface UserType {
  fullName: string;
  aliasName?: string;
  emailVerified: boolean;
  pushToken: string;
  email?: string;
  negativeRatingCount:number;
  classification:string;
  isBlacklisted: boolean;
  phone?: string;
  profileImage?: string;
  role: "user" | "admin" | "superadmin";
  
  firebaseUID: string;
  authProvider: "firebase" | "local";

  isVerified: boolean;
  isBanned: boolean;
  isActive: boolean;
  addresses: Address[];
  defaultAddressId?: string | null;

  language: "ar" | "en";
  theme: "light" | "dark";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  loginHistory: {
    ip: string;
    userAgent: string;
    at: Date;
  }[];

  favorites: string[]; // ObjectId[]
  notificationsFeed: NotificationFeed[];

  wallet: Wallet;
  security: Security;
  transactions: Transaction[];
  activityLog: ActivityLog[];
}

interface MulterRequest extends Request {
  file: any;
}
