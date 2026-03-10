import express from "express";
import {
  createCoupon,
  getCoupons,
  verifyCoupon,
  deleteCoupon,
} from "../controllers/coupons";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/", protect, authorize("admin"), getCoupons);
router.post("/", protect, authorize("admin"), createCoupon);
router.post("/verify", protect, verifyCoupon);
router.delete("/:id", protect, authorize("admin", "manager"), deleteCoupon);

export default router;
