import { Router } from "express";
import { Request, Response } from "express";

import {
  getAllUsers,
  getUserById,
  updateUserAdmin,
  updateUserRole
} from "../controllers/adminUserController";
import { verifyFirebase } from "../middleware/verifyFirebase";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { User } from "../models/user";
import { Product } from "../models/market/Product";

const router = Router();

router.get("/users", verifyFirebase, getAllUsers);
router.get("/users/:id", verifyFirebase, getUserById);
router.patch("/users/:id", verifyFirebase, updateUserAdmin);
router.patch("/users/:id/role", verifyFirebase, verifyAdmin, updateUserRole);

router.get("/check-role", verifyFirebase, (req, res) => {
        if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }
  User.findOne({ firebaseUID: req.user.id })
    .then((user) => {
      if (!user) return res.status(404).json({ message: "Not found" });
      return res.json({ role: user.role });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/stats", verifyFirebase, verifyAdmin, async (req, res) => {
  try {
    const total = await User.countDocuments();
    const admins = await User.countDocuments({ role: "admin" });
    const users = await User.countDocuments({ role: "user" });
    const active = await User.countDocuments({ isBlocked: false });
    const blocked = await User.countDocuments({ isBlocked: true });

    res.json({ total, admins, users, active, blocked });
  } catch (err) {
    res.status(500).json({ message: "Error loading stats", error: err });
  }
});

export default router;
