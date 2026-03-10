import express from "express";
import {
  getDashboardStats,
  getSellerDashboardStats,
} from "../controllers/analytics";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.use(protect);
router.get(
  "/dashboard",
  authorize("admin", "manager", "supervisor"),
  getDashboardStats,
);
router.get("/seller", authorize("seller"), getSellerDashboardStats);

export default router;
