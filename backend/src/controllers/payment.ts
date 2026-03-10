import Razorpay from "razorpay";
import crypto from "crypto";
import { Request, Response } from "express";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_XXXXXXXXXX",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_secret",
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for the given amount
 */
export const createRazorpayOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return;
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise (1 INR = 100 paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_XXXXXXXXXX",
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Payment initiation failed",
      });
  }
};

/**
 * POST /api/payment/verify
 * Verifies the Razorpay payment signature
 */
export const verifyRazorpayPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "your_secret";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res
        .status(400)
        .json({
          success: false,
          message: "Payment verification failed — invalid signature",
        });
      return;
    }

    res.status(200).json({
      success: true,
      paymentId: razorpay_payment_id,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};
