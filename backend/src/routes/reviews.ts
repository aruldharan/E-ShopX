import express from "express";
import {
  createReview,
  getProductReviews,
  approveReview,
  deleteReview,
} from "../controllers/reviews";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/:productId", getProductReviews);
router.post("/", protect, createReview);
router.put(
  "/:id/approve",
  protect,
  authorize("admin", "manager"),
  approveReview,
);
router.delete("/:id", protect, authorize("admin", "manager"), deleteReview);

export default router;
