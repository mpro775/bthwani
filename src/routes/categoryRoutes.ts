import { NextFunction, Response, Router,Request } from "express";
import { createCategory, deleteCategory, getAllCategories, getNestedCategories, updateCategory } from "../controllers/market/categoryController";
import { verifyFirebase } from "../middleware/verifyFirebase";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { ProductCategory } from "../models/market/ProductCategory";
import { getCategoriesWithCounts } from "../controllers/market/categoryController";

import multer from "multer";

const router = Router();
const upload = multer({ dest: "temp/" });

router.post("/", verifyFirebase, verifyAdmin, createCategory);
router.get("/", getCategoriesWithCounts);


// فئات - Admin فقط


router.patch("/:id", verifyFirebase, verifyAdmin, updateCategory);
router.delete("/:id", verifyFirebase, verifyAdmin, deleteCategory);
router.get("/nested", getNestedCategories);


export default router;
