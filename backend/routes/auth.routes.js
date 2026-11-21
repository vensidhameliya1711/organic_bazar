import express from "express";
import upload from "../config/multer.js";
import { authAdmin, authUser, isAuthenticated } from "../middlewares/auth.middleware.js";

import {
  register,
  login,
  logout,
  checkAuth,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  getAllProducts,
  getAllUsers,
  getAllSellers,
  getAllOrders,
  getAdminDashboard,
  updateProductStatus,
  updateUserStatus,
  updateSellerStatus,
  becomeSeller,
 
} from "../controllers/authController.js";
import User from "../models/user.model.js";

const router = express.Router();

/* ===================== AUTH ===================== */
router.post("/register", upload.single("profile"), register);
router.post("/login", login);
router.get("/check", isAuthenticated, checkAuth);
router.post("/logout", isAuthenticated, logout);

/* ===================== PROFILE ===================== */
router.get("/profile", isAuthenticated, getProfile);

router.put(
  "/profile",
  isAuthenticated,
  upload.single("profile"),
  updateProfile
);

router.put(
  "/profile/change-password",
  isAuthenticated,
  changePassword
);

/* ===================== FORGOT PASSWORD ===================== */
// router.post("/forgot-password/send-otp", sendOtp);
// router.post("/forgot-password/verify-otp", verifyOtp);
// router.post("/forgot-password/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);
router.post("/become-seller", isAuthenticated, becomeSeller);
router.get("/my-request", authUser, async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .select("sellerRequest");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      sellerRequest: user.sellerRequest,
    });

  } catch (error) {

    console.error("Error fetching seller request:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
});
/* ===================== ADMIN ===================== */
router.get("/admin/dashboard", isAuthenticated, getAdminDashboard);
router.get("/admin/products", isAuthenticated, getAllProducts);
router.get("/admin/users", isAuthenticated, getAllUsers);
router.put("/admin/users/:id", isAuthenticated, updateUserStatus);
router.put("/admin/products/:id", isAuthenticated, updateProductStatus);
router.get("/admin/sellers", isAuthenticated, getAllSellers);
router.put("/admin/sellers/:id", isAuthenticated, updateSellerStatus);
router.get("/admin/orders", isAuthenticated, getAllOrders);

export default router;
