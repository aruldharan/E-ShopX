import express from "express";
import { getCart, addToCart, removeFromCart } from "../controllers/carts";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);

export default router;
