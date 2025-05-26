declare module 'express';
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        id?: string;         // إذا تضع id المستخدم في الـreq.user
      };
    }
  }
}
