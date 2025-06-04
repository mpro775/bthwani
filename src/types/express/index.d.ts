// types/express/index.d.ts
import * as express from "express";
import { UserDocument } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      // إضافة حقل user
      user?: {
        uid?: string;
        id?: string;
        // يمكنك إضافة حقول أخرى حسب الحاجة
        email?: string;
        role?: string;
        date?: Date;
      };
      userData?: UserDocument;

      // params عامة
      params: Record<string, string>;
    }
  }
}

// تأكّد من أن هذا الملف لا يعرِّف دالة Number!
// (أزل أي declare function Number(...))
export {};
