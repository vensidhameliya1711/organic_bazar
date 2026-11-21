// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema(
{
  // Basic Info
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    match: [/^[A-Za-z\s]+$/, "Name should contain only letters and spaces"],
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },

  phone: {
    type: String,
    required: function () { return this.role !== "admin"; },
    validate: {
      validator: function (v) {
        return /^(\+91)?\d{10}$/.test(v);
      },
      message: "Phone number must be 10 digits",
    },
  },

   address: {
      type: String,
      default: "",
      trim: true,
    },

  password: {
    type: String,
    required: true,
    minlength: 6,
    validate: {
      validator: function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(value);
      },
      message:
        "Password must contain uppercase, lowercase, number and special character",
    },
  },

  // Role system
  role: {
    type: String,
    enum: ["user", "seller", "admin"],
    default: "user",
  },
  // ================= SELLER WALLET =================
  wallet: {
    type: Number,
    default: 0,
  },

  // Seller request system
  sellerRequest: {
    status: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    farmName: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    requestedAt: Date,
    approvedAt: Date,
  },

  // Cart
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      price: Number,
    },
  ],

  // Profile image
  profile: {
    type: String,
    default: "",
  },

  // Soft delete
  isDeleted: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },

  deletedAt: Date,

  // Forgot password
  resetPasswordToken: String,
  resetPasswordExpire: Date,

},
{ timestamps: true }
);



// ================= PASSWORD HASH =================

userSchema.pre("save", async function (next)
{
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});



// ================= COMPARE PASSWORD =================

userSchema.methods.comparePassword = async function (candidatePassword)
{
  return bcrypt.compare(candidatePassword, this.password);
};



// ================= RESET TOKEN =================

userSchema.methods.getResetPasswordToken = function ()
{
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken =
    crypto.createHash("sha256").update(resetToken).digest("hex");

  this.resetPasswordExpire =
    Date.now() + 15 * 60 * 1000;

  return resetToken;
};



// ================= SELLER REQUEST =================

// User seller request kare
userSchema.methods.requestSellerRole = function (farmName, address)
{
  this.sellerRequest = {
    status: "pending",
    farmName,
    address,
    requestedAt: new Date(),
  };

  return this.save();
};



// Admin approve kare
userSchema.methods.approveSellerRole = function ()
{
  this.role = "seller";

  this.sellerRequest.status = "approved";
  this.sellerRequest.approvedAt = new Date();

  return this.save();
};



// Admin reject kare
userSchema.methods.rejectSellerRole = function ()
{
  this.sellerRequest.status = "rejected";

  return this.save();
};



// ================= MODEL =================

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);



// ================= CREATE DEFAULT ADMIN =================

const createDefaultAdmin = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!admin) {
    await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: "admin",
      isDeleted: 1,
    });
    console.log("✅ Default admin created");
  }
};
createDefaultAdmin();




export default User;
