import express from "express";
import {
  getProducts,
  getProductById,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/", getProducts);
router.get(
  "/seller",
  protect,
  authorize("admin", "manager", "seller"),
  getSellerProducts,
);
router.get("/:id", getProductById);
router.post(
  "/",
  protect,
  authorize("admin", "manager", "seller"),
  createProduct,
);
router.put(
  "/:id",
  protect,
  authorize("admin", "manager", "seller"),
  updateProduct,
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "manager", "seller"),
  deleteProduct,
);

export default router;
