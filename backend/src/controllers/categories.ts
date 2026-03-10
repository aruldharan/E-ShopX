import { Request, Response } from "express";
import Category from "../models/Category";

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().populate("parent", "name");
    res.status(200).json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parent } = req.body;
    const slug = name.toLowerCase().split(" ").join("-");
    const category = await Category.create({ name, description, parent, slug });
    res.status(201).json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
