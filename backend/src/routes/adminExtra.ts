import express from "express";
import { protect, authorize } from "../middlewares/auth";
import {
  getLowStockAlerts,
  getStaffLogs,
  getTopCustomers,
  getPendingReviews,
} from "../controllers/adminExtra";

const router = express.Router();

router.use(protect);

// Manager and Admin can access low stock, top customers, and pending reviews
router.get("/low-stock", authorize("admin", "manager"), getLowStockAlerts);
router.get("/top-customers", authorize("admin", "manager"), getTopCustomers);
router.get(
  "/reviews/pending",
  authorize("admin", "manager"),
  getPendingReviews,
);

// Only Admin can see staff activity logs
router.get("/logs", authorize("admin"), getStaffLogs);

export default router;
