import { Request, Response, NextFunction } from "express";
import admin from "../config/firebaseAdmin";

export const verifyFirebase = async (
  
  req: Request,
  res: Response,
  next: NextFunction
) => {
    console.log("=== verifyFirebase: بدأ التحقق ===");
  console.log("Authorization header:", req.headers.authorization);
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    console.warn("🔐 No token provided in Authorization header.");
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    console.log("🔐 Received Token:", token);
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Token verified. UID:", decoded.uid);

    req.user = {
      id: decoded.uid,
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role as any,
      date: new Date(), // أو decoded.auth_time إذا عندك
    };
    console.log(">>> verifyFirebase - decoded user:", req.user);

    next();
  } catch (error: any) {
    console.error("❌ Firebase verification failed:", error.message || error);
    res.status(401).json({ message: "Unauthorized: Invalid token", error });
    return;
  }
};
