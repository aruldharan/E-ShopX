import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const getSignedToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "supersecretkey", {
    expiresIn: (process.env.JWT_EXPIRE || "30d") as any,
  });
};

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = getSignedToken(user._id);

  const options = {
    expires: new Date(
      Date.now() +
        Number(process.env.COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });
    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
export const logout = async (req: Request, res: Response) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};
