import { UserDocument } from "../../src/models/user"; // حسب مكان النموذج عندك

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        
        email?: string;
        uid?: string; // في حالة Firebase UID
        role?: "user" | "admin" | "superadmin" | "delivery";
      };
      userData?: UserDocument; // 👈 نضيف هذا لتجنب الخطأ الثاني
    }
  }
}
