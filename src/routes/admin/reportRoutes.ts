import { Router } from "express";
import { verifyFirebase } from "../../middleware/verifyFirebase";
import { verifyAdmin } from "../../middleware/verifyAdmin";
import {
  getStoresReport,
  getOrdersReport,
  getCustomersReport,
  getUsersReport,
  getDriversReport,
} from "../../controllers/admin/report.controller";

const router = Router();

router.get("/reports/stores", verifyFirebase, verifyAdmin, getStoresReport);
router.get("/reports/orders", verifyFirebase, verifyAdmin, getOrdersReport);
router.get("/reports/customers", verifyFirebase, verifyAdmin, getCustomersReport);
router.get("/reports/users", verifyFirebase, verifyAdmin, getUsersReport);
router.get("/reports/drivers", verifyFirebase, verifyAdmin, getDriversReport);

export default router;
