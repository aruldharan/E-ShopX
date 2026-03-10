import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: mongoose.Types.ObjectId;
  subcategory?: string;
  images: string[];
  seller: mongoose.Types.ObjectId;
  stock: number;
  ratings: number;
  numOfReviews: number;
  isPublished: boolean;
  isFeatured: boolean;

  // Generic variants (legacy)
  variants: {
    name: string;
    options: string[];
  }[];

  // Clothing-specific structured attributes
  productType?:
    | "clothing"
    | "electronics"
    | "home"
    | "sports"
    | "beauty"
    | "books"
    | "general";
  sizes?: string[]; // e.g. ["XS","S","M","L","XL","XXL"]
  colors?: string[]; // e.g. ["Red","Blue","Black"]
  fabric?: string; // e.g. "100% Cotton"
  fit?: string; // e.g. "Regular Fit", "Slim Fit"
  gender?: "Men" | "Women" | "Unisex" | "Boys" | "Girls";
  pattern?: string; // e.g. "Solid", "Striped", "Checkered"
  sleeve?: string; // e.g. "Full Sleeve", "Half Sleeve", "Sleeveless"
  occasion?: string; // e.g. "Casual", "Formal", "Party", "Sport"
  brand?: string;
  highlights?: string[]; // Feature bullet points like Amazon

  // Electronics specific
  warranty?: string;
  modelNumber?: string;
  specifications?: { key: string; value: string }[];
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: String },
    images: [{ type: String }],
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stock: { type: Number, required: true, default: 0 },
    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    variants: [
      {
        name: { type: String },
        options: [{ type: String }],
      },
    ],

    // Clothing attributes
    productType: {
      type: String,
      enum: [
        "clothing",
        "electronics",
        "home",
        "sports",
        "beauty",
        "books",
        "general",
      ],
      default: "general",
    },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    fabric: { type: String },
    fit: { type: String },
    gender: { type: String, enum: ["Men", "Women", "Unisex", "Boys", "Girls"] },
    pattern: { type: String },
    sleeve: { type: String },
    occasion: { type: String },
    brand: { type: String },
    highlights: [{ type: String }],

    // Electronics attributes
    warranty: { type: String },
    modelNumber: { type: String },
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IProduct>("Product", productSchema);
