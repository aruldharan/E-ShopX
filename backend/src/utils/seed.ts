import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

import User from "../models/User";
import Category from "../models/Category";
import Product from "../models/Product";
import Coupon from "../models/Coupon";

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@shopx.com",
    password: "admin123",
    role: "admin",
    isVerified: true,
  },
  {
    name: "Jane Doe",
    email: "user@shopx.com",
    password: "user123",
    role: "user",
    isVerified: true,
  },
  {
    name: "John Smith",
    email: "seller@shopx.com",
    password: "seller123",
    role: "seller",
    isVerified: true,
  },
];

const sampleCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets and electronics",
  },
  { name: "Fashion", slug: "fashion", description: "Clothing and accessories" },
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Home improvement and garden",
  },
  { name: "Sports", slug: "sports", description: "Sports and outdoor" },
  { name: "Books", slug: "books", description: "Books and literature" },
  { name: "Beauty", slug: "beauty", description: "Beauty and personal care" },
];

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing data
    const db = mongoose.connection.db!;
    await db.dropDatabase();
    console.log("Cleared existing data");

    // Create users (Real model will handle hashing via pre-save hook)
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`Created ${createdCategories.length} categories`);

    const adminUser = createdUsers[0];
    const electronicsId = createdCategories[0]._id;
    const fashionId = createdCategories[1]._id;
    const booksId = createdCategories[4]._id;


    const sampleProducts = [
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description: "The latest iPhone with titanium design and A17 Pro chip.",
        price: 134900,
        discountPrice: 124900,
        category: electronicsId,
        images: ["https://picsum.photos/seed/iphone/400/400"],
        seller: adminUser._id,
        stock: 50,
        ratings: 4.8,
        numOfReviews: 248,
        isFeatured: true,
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description:
          "Galaxy AI-powered smartphone with 200MP camera and S Pen.",
        price: 129999,
        discountPrice: 109999,
        category: electronicsId,
        images: ["https://picsum.photos/seed/samsung/400/400"],
        seller: adminUser._id,
        stock: 30,
        ratings: 4.6,
        numOfReviews: 183,
        isFeatured: true,
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        slug: "sony-wh-1000xm5-headphones",
        description:
          "Industry-leading noise cancellation with 30-hour battery life.",
        price: 29990,
        discountPrice: 24990,
        category: electronicsId,
        images: ["https://picsum.photos/seed/headphones/400/400"],
        seller: adminUser._id,
        stock: 75,
        ratings: 4.9,
        numOfReviews: 512,
        isFeatured: true,
      },
      {
        name: "MacBook Air M3",
        slug: "macbook-air-m3",
        description: "15-inch MacBook Air with M3 chip. All-day battery life.",
        price: 134900,
        discountPrice: 124900,
        category: electronicsId,
        images: ["https://picsum.photos/seed/macbook/400/400"],
        seller: adminUser._id,
        stock: 20,
        ratings: 4.7,
        numOfReviews: 92,
      },
      {
        name: "Men's Casual T-Shirt",
        slug: "mens-casual-t-shirt",
        description: "Premium cotton T-Shirt for everyday comfort.",
        price: 999,
        discountPrice: 699,
        category: fashionId,
        images: ["https://picsum.photos/seed/tshirt/400/400"],
        seller: adminUser._id,
        stock: 200,
        ratings: 4.2,
        numOfReviews: 67,
      },
      {
        name: "Women's Running Shoes",
        slug: "womens-running-shoes",
        description: "Lightweight running shoes with cushion support.",
        price: 4999,
        discountPrice: 3499,
        category: fashionId,
        images: ["https://picsum.photos/seed/shoes/400/400"],
        seller: adminUser._id,
        stock: 150,
        ratings: 4.5,
        numOfReviews: 89,
      },
      {
        name: "The Pragmatic Programmer",
        slug: "the-pragmatic-programmer",
        description: "A guide for those who want to become better programmers.",
        price: 899,
        discountPrice: 649,
        category: booksId,
        images: ["https://picsum.photos/seed/book1/400/400"],
        seller: adminUser._id,
        stock: 300,
        ratings: 4.8,
        numOfReviews: 1204,
      },
      {
        name: "Clean Code",
        slug: "clean-code",
        description:
          "A handbook of agile software craftsmanship by Robert C. Martin.",
        price: 799,
        discountPrice: 599,
        category: booksId,
        images: ["https://picsum.photos/seed/book2/400/400"],
        seller: adminUser._id,
        stock: 250,
        ratings: 4.7,
        numOfReviews: 845,
      },
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);

    await Coupon.create({
      code: "SAVE10",
      discount: 10,
      expiryDate: new Date("2027-12-31"),
      minOrderValue: 500,
      isActive: true,
    });
    await Coupon.create({
      code: "WELCOME20",
      discount: 20,
      expiryDate: new Date("2027-12-31"),
      minOrderValue: 1000,
      isActive: true,
    });
    console.log("Created 2 coupons: SAVE10, WELCOME20");

    console.log("\nDatabase seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:  admin@shopx.com / admin123");
    console.log("User:   user@shopx.com / user123");
    console.log("Coupon: SAVE10 (10% off ₹500+), WELCOME20 (20% off ₹1000+)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDB();
