import { Router } from 'express';
import * as controller from '../../controllers/vendor_app/vendor.controller';
import { verifyFirebase } from '../../middleware/verifyFirebase';
import { requireRole } from '../../middleware/auth';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import { addVendor } from '../../controllers/admin/vendorController';

const router = Router();

// كل المسارات هنا محمية بمستخدم مسجّل من نوع vendor

// جلب بيانات التاجر (vendor نفسه)
router.get('/vendor/me', controller.getMyProfile);

// تعديل بيانات التاجر (fullName, phone, إلخ)
router.put(
  '/vendor/me',
  // تحقق من صحة الحقول هنا
  controller.updateMyProfile
);
router.post(
  "/",
  verifyFirebase,
  verifyAdmin,
  addVendor
);
// إضافة متجر جديد (مثلاً يربط vendor بمتجر)
// body: { storeId: ObjectId }
router.post(
  '/vendor/stores',
  controller.attachStoreToVendor
);

// حذف الربط أو تعطيل المتجر الخاص بالتاجر
router.delete(
  '/vendor/stores/:storeId',
  controller.detachStoreFromVendor
);
router.get(
  "/merchant/reports",
  verifyFirebase,
  requireRole(["vendor"]),
  controller.getMerchantReports
);
router.get(
  "/",
  verifyFirebase,
  verifyAdmin,
  controller.listVendors
);
export default router;
