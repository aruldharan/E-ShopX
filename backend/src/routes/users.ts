import express from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  createUser,
  updateUserRole,
  becomeSeller,
  getStoreDetails,
} from "../controllers/users";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/store/:id", getStoreDetails);

router.use(protect);

router.put("/become-seller", becomeSeller);

router.use(authorize("admin"));

router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
