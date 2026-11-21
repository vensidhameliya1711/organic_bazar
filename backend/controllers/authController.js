import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Contact from "../models/Contact.js";
import PasswordReset from "../models/PasswordReset.js";
import { sendOTPEmail } from "../utils/sendOTPEmail.js";
import dotenv from "dotenv";

dotenv.config();

// ------------------- Helper -------------------
const normalizePhone = (phone) => {
  if (!phone) return "";
  let val = phone.replace(/\D/g, ""); // remove non-digits
  if (val.length === 10) val = "91" + val; // add country code if missing
  return `+${val}`;
};


export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // ✅ Required fields validation
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const profileImage = req.file ? req.file.filename : "";

    const newUser = new User({
      name,
      email,
      password,
      phone,
      address,
      profile: profileImage,
      role: "user",
      isDeleted: 1,
      cartItems: [],
    });

    await newUser.save();

    req.session.user = {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      profile: newUser.profile || "",
      role: newUser.role, // 🔥 important future ke liye
      cartItems: [],
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: req.session.user,
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Check required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    let user;

    // 🔹 Admin login
    if (email === process.env.ADMIN_EMAIL) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "Invalid admin credentials" });
      }

      user = {
        _id: "admin-id",
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        phone: "",
        role: "admin",
        profile: "",
        address: "",
        cartItems: [],
      };
    } else {
      // 🔹 Normal user login
      user = await User.findOne({ email }).populate("cartItems.productId");

      // ❌ User not found
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // 🚫 User is deactivated
      if (user.isDeleted === 0) {
        return res.status(403).json({ success: false, message: "Your account is deactivated. Please contact support." });
      }

      // 🔑 Password check
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
    }

    // 🔹 Save user info + cart in session
    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      profile: user.profile || "",
      address: user.address || "",
      cartItems: user.cartItems || [],
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, message: "Session error" });
      }

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: req.session.user,
      });
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const checkAuth = (req, res) => {
  try {
    if (!req.session.user) {
  return res.status(401).json({ success: false });
}


    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("Check auth error:", err);
    res.status(500).json({ success: false });
  }
};

// ------------------- LOGOUT -------------------
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};

// ------------------- FORGOT PASSWORD -------------------
export const forgotPassword = async (req, res) => {

  try {

    const email = req.body.email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await PasswordReset.deleteMany({ email });

    await PasswordReset.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }

};

// ------------------- RESET PASSWORD -------------------
export const resetPassword = async (req, res) => {

  try {

    const { email, otp, newPassword } = req.body;

    const record = await PasswordReset.findOne({ email, otp });

    if (!record)
      return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email },
      { password: hashedPassword }
    );

    await PasswordReset.deleteMany({ email });

    res.json({ message: "Password reset successful" });

  } catch (error) {

    res.status(500).json({ message: "Reset failed" });

  }

};




export const getProfile = async (req, res) => {
  try {
    const sessionUser = req.session.user;

    if (!sessionUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
 if (sessionUser.role === "admin") {
      return res.status(200).json({
        success: true,
        user: sessionUser,
      });
    }
    const user = await User.findById(sessionUser._id)
      .populate("cartItems.productId")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Check if approved seller
    const isApprovedSeller =
      user.role === "seller" &&
      user.sellerRequest?.status === "approved";

    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      profile: user.profile || "",
      cartItems: user.cartItems || [],

      // ✅ Role-based fields
      address: isApprovedSeller
        ? user.sellerRequest?.address || ""
        : user.address || "",

      farmName: isApprovedSeller
        ? user.sellerRequest?.farmName || ""
        : "",

      // Optional: full seller request (for seller dashboard)
      sellerRequest: user.sellerRequest || {},
    };

    console.log("getProfile API called");

    return res.status(200).json({
      success: true,
      user: responseUser,
    });

  } catch (error) {
    console.error("getProfile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user?._id;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    if (req.session.user.role === "admin")
      return res.status(403).json({
        success: false,
        message: "Admins cannot update profile",
      });

    const { name, phone, farmName, address } = req.body;

    const updateData = {};

    if (name !== undefined && name !== null)
      updateData.name = String(name).trim();

    if (phone !== undefined && phone !== null) {
      let normalized = String(phone).replace(/\D/g, "");
      if (normalized.length === 10) normalized = "91" + normalized;
      updateData.phone = "+" + normalized;
    }

    if (farmName !== undefined && farmName !== null)
      updateData.farmName = String(farmName).trim();

    if (address !== undefined && address !== null)
      updateData.address = String(address).trim();

    if (req.file?.filename)
      updateData.profile = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    // update session
    req.session.user = {
      ...req.session.user,
      name: updatedUser.name,
      phone: updatedUser.phone || "",
      farmName: updatedUser.farmName || "",
      address: updatedUser.address || "",
      profile: updatedUser.profile || "",
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: req.session.user,
    });

  } catch (err) {
    console.error("Update Profile Error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// ------------------- CHANGE PASSWORD -------------------
export const changePassword = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Current password incorrect" });

    user.password = newPassword; // pre-save hook will hash
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Failed to change password" });
  }
};

let otpStore = {};


// ------------------- ADMIN FUNCTIONS -------------------
// Only allow if role is admin
const isAdmin = (req) => req.session?.user?.role === "admin";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Access denied" });

    const products = await Product.find().populate("seller", "name email")
    .populate("category", "name slug");
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all users (role: "user")
export const getAllUsers = async (req, res) => {
  try {
    // Only admin can access
    if (!isAdmin(req)) 
      return res.status(403).json({ success: false, message: "Access denied" });

    // Fetch all users, active or deleted
    const users = await User.find({ role: "user" }).select("-password");

    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update product status (soft delete / restore)
export const updateProductStatus = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Access denied" });

    const { id } = req.params;
    const { isDeleted } = req.body; // expected 0 or 1

    const product = await Product.findByIdAndUpdate(
      id,
      { isDeleted },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error("Update Product Status Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get all sellers
export const getAllSellers = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, message: "Access denied" });

    const sellers = await User.find({ role: "seller" }).select("-password");
    res.json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getAllOrders = async (req, res) => {
  try {
    if (!isAdmin(req))
      return res.status(403).json({ success: false, message: "Access denied" });

    const orders = await Order.find()
      .populate("userId", "name email") // fetch user name and email
      .populate("items.product", "name offerPrice images") // fetch product details
      .populate("items.seller", "name email") // fetch seller details
      .sort({ createdAt: -1 }); // already includes date info

    // Map orders to include date in a readable format if needed
    const ordersWithDate = orders.map((order) => ({
      ...order._doc,
      orderDate: order.createdAt, // or order.date if you have a custom date field
    }));

    res.json({ success: true, orders: ordersWithDate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalOrders = await Order.countDocuments();
    const totalMessages = await Contact.countDocuments({ isDeleted: 1 ,createdAt: {
    $gte: new Date(new Date().setHours(0, 0, 0, 0)), // today at 00:00:00
    $lt: new Date(new Date().setHours(23, 59, 59, 999)) // today at 23:59:59
  }}); // only active messages

    const totalSellerRequests = await User.countDocuments({
      "sellerRequest.status": "pending",
      isDeleted: 1
    });
const adminCommissionAgg = await Order.aggregate([
  {
    $match: {
      isDeleted: 1,
      paymentStatus: "Success",
    }
  },
  { $unwind: "$items" },
  {
    $match: {
      "items.isCancelled": false
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$items.adminCommission" }
    }
  }
]);

const totalAdminCommission =
  adminCommissionAgg.length > 0 ? adminCommissionAgg[0].total : 0;
// ================= SELLER PAYOUT =================
const sellerPayoutAgg = await Order.aggregate([
  {
    $match: {
      isDeleted: 1,
      paymentStatus: "Success",
    }
  },

  { $unwind: "$items" },

  {
    $match: {
      "items.isCancelled": false
    }
  },

  // ⚠ Agar payout array hai tabhi unwind karo
  { $unwind: "$items.payout" },

  {
    $match: {
      "items.payout.isPaidToSeller": true
    }
  },

  {
    $group: {
      _id: null,
      total: { $sum: "$items.sellerAmount" }
    }
  }
]);
const totalSellerPayout =
  sellerPayoutAgg.length > 0 ? sellerPayoutAgg[0].total : 0;

    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalSellers,
      totalOrders,
      totalMessages,
      totalSellerRequests,
      totalAdminCommission,
      totalSellerPayout,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDeleted } = req.body; // 0 or 1

    if (typeof isDeleted !== "number") {
      return res.status(400).json({ success: false, message: "isDeleted must be 0 or 1" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isDeleted },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User status updated", user });
  } catch (err) {
    console.error("Update User Status Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update seller status (soft delete / restore)
export const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDeleted } = req.body; // 0 or 1

    if (!req.session?.user || req.session.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Access denied" });

    if (typeof isDeleted !== "number")
      return res.status(400).json({ success: false, message: "isDeleted must be 0 or 1" });

    const seller = await User.findByIdAndUpdate(
      id,
      { isDeleted },
      { new: true }
    ).select("-password");

    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    res.json({ success: true, message: "Seller status updated", seller });
  } catch (err) {
    console.error("Update Seller Status Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
//seller request
export const becomeSeller = async (req, res) => {
  try {
    const { farmName, address } = req.body;

    if (!req.session.user || !req.session.user._id) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.sellerRequest?.status === "pending") {
      return res.status(400).json({ message: "Request already pending" });
    }

    if (user.role === "seller") {
      return res.status(400).json({ message: "Already a seller" });
    }

    user.sellerRequest = {
      status: "pending",
      farmName,
      address,
      requestedAt: new Date(),
    };

    await user.save();

    res.json({ success: true, message: "Seller request submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
