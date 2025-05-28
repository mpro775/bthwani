
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
}

export interface Security {
  pinCode: string | null;
  twoFactorEnabled: boolean;
}

export interface Transaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  date: Date;
}

export interface ActivityLog {
  action: string;
  target: string;
at?: Date;
}

export interface FreelancerProfile {
  service?: string;
  bio?: string;
  portfolioImages: string[];
}

export interface NotificationFeed {
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

export interface UserType {
  fullName: string;
  aliasName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  role: "user" | "admin" | "superadmin" | "driver";

 isDriver?: boolean;
  isAvailableForDelivery?: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  deliveryStats?: {
    deliveredCount: number;
    canceledCount: number;
    totalDistanceKm: number;
    earnings: number;
  };
  
  firebaseUID: string;
  authProvider: "firebase" | "local";

  isVerified: boolean;
  isBanned: boolean;
  isActive: boolean;
  followers: string[];
  following: string[];

  addresses: Address[];
defaultAddressId: { type: String, default: null },

  language: "ar" | "en";
  theme: "light" | "dark";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  postsCount: number;
  messagesCount: number;
  followersCount: number;
  favoritesCount: number;

  loginHistory: {
    ip: string;
    userAgent: string;
    at: Date;
  }[];


  favorites: string[]; // ObjectId[]
  notificationsFeed: NotificationFeed[];

  // blood
  bloodType?: string;
  isAvailableToDonate?: boolean;
  bloodRequests: string[]; // ObjectId[]

  // freelancer
  isFreelancer?: boolean;
  freelancerProfile?: FreelancerProfile;

  // jobs/bookings
  jobPosts: string[];
  bookingPosts: string[];
  bookingStats: {
    views: number;
    orders: number;
  };

  // lost & found
  lostAndFoundPosts: string[];
  lostStats: {
    views: number;
    comments: number;
  };

  wallet: Wallet;
  security: Security;
  transactions: Transaction[];
  activityLog: ActivityLog[];
}

interface MulterRequest extends Request {
  file: any;
}
