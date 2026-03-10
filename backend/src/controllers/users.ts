import { Request, Response } from "express";
import User from "../models/User";

// @desc    Get all users
// @route   GET /api/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Create user (Admin only)
// @route   POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upgrade user to seller
// @route   PUT /api/users/become-seller
// @access  Private
export const becomeSeller = async (req: Request, res: Response) => {
  try {
    const { storeName, storeDescription } = req.body;

    if (!storeName || !storeDescription) {
      return res.status(400).json({
        success: false,
        message: "Store name and description are required",
      });
    }

    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (["admin", "manager", "supervisor"].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: "Staff accounts cannot become sellers.",
      });
    }

    user.role = "seller";
    user.store = {
      name: storeName,
      description: storeDescription,
    };

    await user.save();
    res.status(200).json({
      success: true,
      message: "Successfully upgraded to Seller!",
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public store details
// @route   GET /api/users/store/:id
// @access  Public
export const getStoreDetails = async (req: Request, res: Response) => {
  try {
    const seller = await User.findOne({
      _id: req.params.id,
      role: "seller",
    }).select("-password");
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    res.status(200).json({ success: true, store: seller });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
