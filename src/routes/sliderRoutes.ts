import { Router } from "express";
import { getSliders, createSlider } from "../controllers/market/bannerControllers";
import { verifyFirebase } from "../middleware/verifyFirebase";
import { verifyAdmin } from "../middleware/verifyAdmin";
import multer from "multer";
const upload = multer({ dest: "temp/" });

const router = Router();

router.get("/", getSliders);
router.post("/", verifyFirebase, verifyAdmin, createSlider);

export default router;
