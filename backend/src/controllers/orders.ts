import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import Notification from "../models/Notification";

// @desc    Create new order
// @route   POST /api/orders
export const addOrderItems = async (req: any, res: Response) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      pointsUsed = 0,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items" });
    }

    const pointsEarned = Math.floor(totalPrice / 100);

    const order = new Order({
      orderItems,
      user: req.user.id,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      pointsUsed,
      pointsEarned,
      isPaid: paymentResult ? true : false,
      paidAt: paymentResult ? Date.now() : undefined,
    });

    const user = await User.findById(req.user.id);
    if (user) {
      user.loyaltyPoints =
        (user.loyaltyPoints || 0) + pointsEarned - pointsUsed;
      await user.save();
    }

    const createdOrder = await order.save();

    await Notification.create({
      user: req.user.id,
      title: "Order Placed Successfully",
      message: `Your order containing ${orderItems.length} items has been placed.`,
      type: "order",
      link: `/orders/${createdOrder._id}`,
    });

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
export const updateOrderToPaid = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).populate("user", "id name");
    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin/Manager/Supervisor)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = req.body.status;
    if (req.body.status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    await Notification.create({
      user: order.user,
      title: `Order ${req.body.status}`,
      message: `Your order status has been updated to ${req.body.status}.`,
      type: "order",
      link: `/orders/${order._id}`,
    });

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete order (Admin/Manager)
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders containing seller's products
// @route   GET /api/orders/seller
export const getSellerOrders = async (req: any, res: Response) => {
  try {
    const sellerProductIds = await Product.find({
      seller: req.user.id,
    }).distinct("_id");
    const orders = await Order.find({
      "orderItems.product": { $in: sellerProductIds },
    })
      .populate("user", "id name email")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
