import axios from "axios";
import { Router } from "express";
import { verifyFirebase } from "../middleware/verifyFirebase";

const router = Router();

router.post("/sign-upload", verifyFirebase, async (req, res) => {
  const { filename } = req.body;

  const uploadUrl = `https://storage.bunnycdn.com/${process.env.BUNNY_STORAGE_ZONE}/${filename}`;
  const accessKey = process.env.BUNNY_STORAGE_KEY;
console.log("🧠 mediaRoutes registered");

  res.json({
    uploadUrl,
    headers: {
      "AccessKey": accessKey,
      "Content-Type": "image/jpeg", // يمكن تغييره حسب نوع الملف
    },
  });
});

export default router;
