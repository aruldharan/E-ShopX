import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "buyer" | "seller" | "admin" | "manager" | "supervisor";
  isVerified: boolean;
  avatar?: string;
  store?: {
    name: string;
    description: string;
    logo?: string;
    banner?: string;
  };
  loyaltyPoints: number;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "buyer", "seller", "admin", "manager", "supervisor"],
      default: "buyer",
    },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    store: {
      name: { type: String },
      description: { type: String },
      logo: { type: String },
      banner: { type: String },
    },
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Encrypt password using bcrypt
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
