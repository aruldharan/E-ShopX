import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("admin", "manager"), createCategory);
router.put("/:id", protect, authorize("admin", "manager"), updateCategory);
router.delete("/:id", protect, authorize("admin", "manager"), deleteCategory);

export default router;
