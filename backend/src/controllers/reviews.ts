import { Request, Response } from "express";
import Review from "../models/Review";
import Product from "../models/Product";

// @desc    Create new review
// @route   POST /api/reviews
export const createReview = async (req: any, res: Response) => {
  try {
    const { rating, comment, productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      product: productId,
    });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ success: false, message: "Product already reviewed" });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    product.numOfReviews = reviews.length;
    product.ratings =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.productId });
    res.status(200).json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve review (Admin/Manager)
// @route   PUT /api/reviews/:id/approve
export const approveReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    review.isApproved = true;
    await review.save();
    res.status(200).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review (Admin/Manager)
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
