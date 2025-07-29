import { Router } from "express";
import * as controller from "../../controllers/vendor_app/vendor.controller";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { requireRole } from "../../middleware/auth";
import { verifyAdmin } from "../../middleware/verifyAdmin";
import { addVendor } from "../../controllers/admin/vendorController";
import Vendor from "../../models/vendor_app/Vendor";

const router = Router();

// كل المسارات هنا محمية بمستخدم مسجّل من نوع vendor
router.get("/", verifyFirebase, verifyAdmin, controller.listVendors);
// جلب بيانات التاجر (vendor نفسه)
router.get("/vendor/me", controller.getMyProfile);

router.post('/auth/vendor-login', controller.vendorLogin);

// تعديل بيانات التاجر (fullName, phone, إلخ)
router.put(
  "/vendor/me",
  // تحقق من صحة الحقول هنا
  controller.updateMyProfile
);
router.post("/", verifyFirebase, verifyAdmin, addVendor);
// إضافة متجر جديد (مثلاً يربط vendor بمتجر)
// body: { storeId: ObjectId }
router.post("/vendor/stores", controller.attachStoreToVendor);

// حذف الربط أو تعطيل المتجر الخاص بالتاجر
router.delete("/vendor/stores/:storeId", controller.detachStoreFromVendor);
router.get(
  "/merchant/reports",
  verifyFirebase,
  requireRole(["vendor"]),
  controller.getMerchantReports
);
router.post('/push-token', async (req, res) => {
  const { vendorId, expoPushToken } = req.body;
  // خزنه عندك بجدول vendor أو user
  await Vendor.updateOne({ _id: vendorId }, { expoPushToken });
  res.json({ success: true });
});
export default router;
