import { Request, Response, NextFunction } from "express";
import { getUserCapabilities } from "../utils/permissions";
import { User } from "../models/user";

export const verifyCapability = (
  context: "admin" | "userApp" | "driverApp",
  capability: keyof ReturnType<typeof getUserCapabilities>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const firebaseUID = req.user?.id;
      const user = await User.findOne({ firebaseUID });
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const capabilities = getUserCapabilities(user, context);
      if (!capabilities[capability]) {
        res.status(403).json({ message: "Insufficient permissions" });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
};
