import express from "express";
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  getSellerOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orders";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin", "manager", "supervisor"),
  getOrders,
);
router.get(
  "/seller",
  protect,
  authorize("seller", "admin", "manager", "supervisor"),
  getSellerOrders,
);
router.post("/", protect, addOrderItems);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "manager", "supervisor", "seller"),
  updateOrderStatus,
);
router.delete("/:id", protect, authorize("admin", "manager"), deleteOrder);

export default router;
