import { Request, Response } from "express";
import Product from "../models/Product";
import Category from "../models/Category";

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, keyword, sort, minPrice, maxPrice, rating } = req.query;
    let query: any = {};

    if (category) query.category = category;
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.ratings = { $gte: Number(rating) };

    let productsQuery = Product.find(query).populate("category", "name");

    if (sort) {
      const sortBy = (sort as string).split(",").join(" ");
      productsQuery = productsQuery.sort(sortBy);
    } else {
      productsQuery = productsQuery.sort("-createdAt");
    }

    const products = await productsQuery;
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
export const createProduct = async (req: any, res: Response) => {
  try {
    req.body.seller = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req: any, res: Response) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Explicitly check seller ownership
    if (
      req.user.role === "seller" &&
      product.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this product",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req: any, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Explicitly check seller ownership
    if (
      req.user.role === "seller" &&
      product.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this product",
      });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get products for the logged in seller
// @route   GET /api/products/seller
export const getSellerProducts = async (req: any, res: Response) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .populate("category", "name")
      .sort("-createdAt");
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
