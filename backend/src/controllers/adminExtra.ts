import { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import User from "../models/User";
import StaffLog from "../models/StaffLog";
import Review from "../models/Review";

// @desc    Get low stock products
// @route   GET /api/admin/low-stock
// @access  Private/Admin/Manager
export const getLowStockAlerts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ stock: { $lte: 10 } })
      .select("name stock price images")
      .sort({ stock: 1 });
    res.json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get staff activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getStaffLogs = async (req: Request, res: Response) => {
  try {
    const logs = await StaffLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get top customers by total spend
// @route   GET /api/admin/top-customers
// @access  Private/Admin/Manager
export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const topCustomers = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          ordersCount: { $count: {} },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          ordersCount: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          avatar: "$userDetails.avatar",
        },
      },
    ]);
    res.json({ topCustomers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get pending reviews for moderation
// @route   GET /api/admin/reviews/pending
// @access  Private/Admin/Manager
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate("user", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to create staff logs
export const logStaffAction = async (
  userId: string,
  action: string,
  targetModel?: string,
  targetId?: string,
  details?: string,
) => {
  try {
    await StaffLog.create({
      user: userId,
      action,
      targetModel,
      targetId,
      details,
    });
  } catch (error) {
    console.error("Failed to log staff action", error);
  }
};
