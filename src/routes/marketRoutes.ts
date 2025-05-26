import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFilteredProducts,
  getActiveOffers,
  getSimilarProducts,
  toggleLikeProduct,
  addComment,
  adminUpdateStatus
} from "../controllers/market/productController";
import { verifyFirebase } from "../middleware/verifyFirebase";
import { uploadMedia } from "../middleware/mediaUpload";
import { verifyAdmin } from "../middleware/verifyAdmin";
import multer from "multer";

const upload = multer({ dest: "temp/" });



const router = Router();

router.post("/products", verifyFirebase, createProduct); 
router.get("/admin/products", verifyFirebase, verifyAdmin, getAllProducts); // هذا يرجع كل المنتجات
router.get("/products/:id", getProductById);
router.patch("/products/:id", verifyFirebase, updateProduct);
router.delete("/products/:id", verifyFirebase, deleteProduct);
router.patch("/products/:id/like", verifyFirebase, toggleLikeProduct);
router.post("/products/:id/comment", verifyFirebase, addComment);
router.patch("/products/:id/status", verifyFirebase, verifyAdmin, adminUpdateStatus);



router.get("/products", getFilteredProducts); // هذا يدعم الفلاتر: category, condition, hasOffer
router.get("/products/active-offers", getActiveOffers);
router.get("/products/:id/similar", getSimilarProducts);

export default router;
