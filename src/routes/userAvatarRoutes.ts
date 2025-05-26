import express from "express";
import { verifyFirebase } from "../middleware/verifyFirebase";
import { uploadAvatar } from "../controllers/userAvatarController";

const router = express.Router();

router.patch("/avatar", verifyFirebase,  uploadAvatar);

export default router;
