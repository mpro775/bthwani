import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firebaseUID = req.user!.uid;
    const user = await User.findOne({ firebaseUID });

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
       res.status(403).json({ message: "Admin access required" });
       return;
    }

    req.userData = user;
    next();

  } catch (err) {
            console.error("verifyAdmin error:", err); // ✅ اطبع الخطأ الحقيقي

    res.status(500).json({ message: "Error verifying admin", error: err });
  }
};
