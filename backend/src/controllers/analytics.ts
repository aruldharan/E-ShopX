import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import Category from "../models/Category";
import User from "../models/User";

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Revenue last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Category distribution
    const categoryData = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          name: "$categoryDetails.name",
          count: 1,
        },
      },
    ]);

    // 3. Order status distribution
    const statusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. General Stats
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        revenue7Days: revenueData,
        categories: categoryData,
        orderStatus: statusData,
        overall: {
          totalOrders,
          totalProducts,
          totalUsers,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard analytics for a seller
// @route   GET /api/analytics/seller
export const getSellerDashboardStats = async (req: any, res: Response) => {
  try {
    const sellerId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Get seller's product IDs
    const sellerProducts = await Product.find({ seller: sellerId }).select(
      "_id",
    );
    const productIds = sellerProducts.map((p) => p._id);

    // 2. Revenue last 7 days (only for seller's products)
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          isPaid: true,
          "orderItems.product": { $in: productIds },
        },
      },
      { $unwind: "$orderItems" },
      {
        $match: {
          "orderItems.product": { $in: productIds },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Category distribution (only seller's products)
    const categoryData = await Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          name: "$categoryDetails.name",
          count: 1,
        },
      },
    ]);

    // 4. Order status distribution (orders containing seller's products)
    const statusData = await Order.aggregate([
      {
        $match: {
          "orderItems.product": { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. General Stats
    const totalOrders = await Order.countDocuments({
      "orderItems.product": { $in: productIds },
    });
    const totalProducts = productIds.length;

    // Calculate total historical revenue for seller
    const totalRevenueAgg = await Order.aggregate([
      { $match: { isPaid: true, "orderItems.product": { $in: productIds } } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.product": { $in: productIds } } },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        revenue7Days: revenueData,
        categories: categoryData,
        orderStatus: statusData,
        overall: {
          totalOrders,
          totalProducts,
          totalUsers: 0, // Sellers shouldn't see total platform users
          totalRevenue: totalRevenueAgg[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
