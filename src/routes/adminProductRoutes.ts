import { Router } from "express";
import { adminGetAllProducts, adminUpdateProduct } from "../controllers/market/adminProductController";
import { verifyFirebase } from "../middleware/verifyFirebase";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = Router();

router.get("/", verifyFirebase, verifyAdmin, adminGetAllProducts);
router.patch("/:id", verifyFirebase, verifyAdmin, adminUpdateProduct);

export default router;
