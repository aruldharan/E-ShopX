import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

const sampleUsers = [
  {
    name: "Admin Boss",
    email: "admin@shopx.com",
    password: "admin",
    role: "admin",
    isVerified: true,
  },
  {
    name: "Manager Mark",
    email: "manager@shopx.com",
    password: "admin",
    role: "manager",
    isVerified: true,
  },
  {
    name: "Super Sam",
    email: "supervisor@shopx.com",
    password: "admin",
    role: "supervisor",
    isVerified: true,
  },
  {
    name: "Test User",
    email: "user@shopx.com",
    password: "user",
    role: "user",
    isVerified: true,
  },
];

const sampleCategories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Garden", slug: "home-garden" },
  { name: "Sports", slug: "sports" },
  { name: "Books", slug: "books" },
  { name: "Beauty", slug: "beauty" },
  { name: "Automotive", slug: "automotive" },
  { name: "Toys & Games", slug: "toys-games" },
  { name: "Health", slug: "health" },
  { name: "Grocery", slug: "grocery" },
];

// Helper functions for random generation
const adjectives = [
  "Premium",
  "Elite",
  "Pro",
  "Ultra",
  "Smart",
  "Wireless",
  "Advanced",
  "Classic",
  "Modern",
  "Vintage",
  "Deluxe",
  "Compact",
  "Heavy-duty",
  "Portable",
  "Digital",
  "Luxury",
];
const nouns = {
  Electronics: [
    "Smartphone",
    "Laptop",
    "Headphones",
    "Monitor",
    "Tablet",
    "Camera",
    "Microphone",
    "Keyboard",
    "Mouse",
    "Speaker",
  ],
  Fashion: [
    "T-Shirt",
    "Jeans",
    "Jacket",
    "Sneakers",
    "Watch",
    "Sunglasses",
    "Backpack",
    "Dress",
    "Sweater",
    "Boots",
  ],
  "Home & Garden": [
    "Sofa",
    "Desk",
    "Chair",
    "Lamp",
    "Planter",
    "Rug",
    "Vase",
    "Cutlery Set",
    "Blender",
    "Coffee Maker",
  ],
  Sports: [
    "Tennis Racket",
    "Football",
    "Yoga Mat",
    "Dumbbells",
    "Treadmill",
    "Water Bottle",
    "Running Shoes",
    "Tent",
    "Bicycle",
    "Gym Bag",
  ],
  Books: [
    "Novel",
    "Biography",
    "Cookbook",
    "Sci-Fi Epic",
    "History Book",
    "Programming Guide",
    "Comic Book",
    "Poetry Collection",
    "Dictionary",
    "Encyclopedia",
  ],
  Beauty: [
    "Lipstick",
    "Perfume",
    "Moisturizer",
    "Shampoo",
    "Hair Dryer",
    "Nail Polish",
    "Face Serum",
    "Mascara",
    "Foundation",
    "Sunscreen",
  ],
  Automotive: [
    "Car Wax",
    "Tire Inflator",
    "Seat Covers",
    "Dash Cam",
    "Jump Starter",
    "Air Freshener",
    "Wiper Blades",
    "Floor Mats",
    "Tool Kit",
    "Motor Oil",
  ],
  "Toys & Games": [
    "Board Game",
    "Action Figure",
    "Puzzle",
    "Building Blocks",
    "Remote Control Car",
    "Doll",
    "Stuffed Animal",
    "Card Game",
    "Yo-Yo",
    "Video Game",
  ],
  Health: [
    "Vitamins",
    "Protein Powder",
    "Blood Pressure Monitor",
    "Thermometer",
    "First Aid Kit",
    "Massager",
    "Scale",
    "Bandages",
    "Knee Brace",
    "Yoga Block",
  ],
  Grocery: [
    "Olive Oil",
    "Coffee Beans",
    "Chocolate Bar",
    "Pasta",
    "Honey",
    "Green Tea",
    "Almonds",
    "Cereal",
    "Mixed Spices",
    "Hot Sauce",
  ],
};
const brands = [
  "Sony",
  "Apple",
  "Samsung",
  "Nike",
  "Adidas",
  "IKEA",
  "Dell",
  "LG",
  "HP",
  "Bose",
  "Asus",
  "Rolex",
  "Casio",
  "Lego",
  "Puma",
];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function seedMassiveDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    const db = mongoose.connection.db!;
    await db.dropDatabase();
    console.log("🗑️ Cleared existing data");

    // 1. Users
    const UserModel = mongoose.model(
      "User",
      new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        role: String,
        isVerified: Boolean,
      }),
    );
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      })),
    );
    const createdUsers = await UserModel.insertMany(hashedUsers);
    const adminId = createdUsers[0]._id;

    // 2. Categories
    const CategoryModel = mongoose.model(
      "Category",
      new mongoose.Schema({
        name: String,
        slug: String,
        description: String,
        parent: { type: mongoose.Schema.Types.ObjectId, default: null },
      }),
    );
    const createdCategories = await CategoryModel.insertMany(sampleCategories);

    // 3. Products
    const ProductModel = mongoose.model(
      "Product",
      new mongoose.Schema({
        name: String,
        description: String,
        price: Number,
        discountPrice: Number,
        category: mongoose.Schema.Types.ObjectId,
        images: [String],
        seller: mongoose.Schema.Types.ObjectId,
        stock: Number,
        ratings: Number,
        numOfReviews: Number,
        isFeatured: Boolean,
      }),
    );

    const products = [];
    let productCount = 0;

    for (const cat of createdCategories) {
      const catNouns = nouns[cat.name as keyof typeof nouns] || [
        "Item",
        "Product",
        "Widget",
      ];

      // Create 55 products per category to reach ~550
      for (let i = 0; i < 55; i++) {
        productCount++;
        const brand = getRandom(brands);
        const adjective = getRandom(adjectives);
        const noun = getRandom(catNouns);

        const price = randomInt(10, 5000) * 10; // Prices from 100 to 50000
        const isDiscounted = Math.random() > 0.5;
        const discountPrice = isDiscounted
          ? Math.floor((price * randomInt(50, 90)) / 100)
          : price;

        products.push({
          name: `${brand} ${adjective} ${noun} V${randomInt(1, 10)}`,
          description: `Experience the ultimate quality with this ${adjective.toLowerCase()} ${noun.toLowerCase()} from ${brand}. Designed for excellence and everyday use.`,
          price,
          discountPrice,
          category: cat._id,
          images: [`https://picsum.photos/seed/${productCount}/400/400`],
          seller: adminId,
          stock: randomInt(0, 500),
          ratings: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Random rating between 3.5 and 5.0
          numOfReviews: randomInt(0, 1500),
          isFeatured: Math.random() > 0.9,
        });
      }
    }

    await ProductModel.insertMany(products);
    console.log(`✅ Created ${products.length} products!`);

    // 4. Coupons
    const CouponModel = mongoose.model(
      "Coupon",
      new mongoose.Schema({
        code: String,
        discount: Number,
        expiryDate: Date,
        minOrderValue: Number,
        isActive: Boolean,
      }),
    );
    await CouponModel.create({
      code: "SAVE20",
      discount: 20,
      expiryDate: new Date("2027-12-31"),
      minOrderValue: 500,
      isActive: true,
    });

    console.log("\n🎉 Massive Database Seeding Complete!");
    console.log("Admin: admin@shopx.com / admin");
    console.log("Manager: manager@shopx.com / admin");
    console.log("Supervisor: supervisor@shopx.com / admin");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedMassiveDB();
