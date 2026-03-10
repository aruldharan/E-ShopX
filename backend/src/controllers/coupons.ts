import { Request, Response } from "express";
import Coupon from "../models/Coupon";

// @desc    Create new coupon
// @route   POST /api/coupons
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, discount, expiryDate, minOrderValue } = req.body;
    const coupon = await Coupon.create({
      code,
      discount,
      expiryDate,
      minOrderValue,
    });
    res.status(201).json({ success: true, coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json({ success: true, count: coupons.length, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify coupon
// @route   POST /api/coupons/verify
export const verifyCoupon = async (req: Request, res: Response) => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon" });
    }

    if (!coupon.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon is no longer active" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired" });
    }

    if (orderValue && orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ${coupon.minOrderValue}`,
      });
    }

    res.status(200).json({ success: true, discount: coupon.discount, coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (Admin/Manager)
// @route   DELETE /api/coupons/:id
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    await coupon.deleteOne();
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
