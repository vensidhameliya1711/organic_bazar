import express from "express";
import { authUser, authSeller, authAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getAllOrders,
  getUserOrders,
  placeOrder,
  getSellerOrders,
  cancelOrderItem,
  // approveOrder,
  // markAsDelivered,
  createRazorpayOrder,
  verifyPayment,
  updateItemStatus,
  paySeller,
  //  mockOnlinePay,
  //  getMockPaymentPage
} from "../controllers/order.controller.js";

const router = express.Router();

// Place Order (COD or ONLINE)
router.post("/place", authUser, placeOrder);

// Get Orders
router.get("/user", authUser, getUserOrders);

router.get("/seller", authSeller, getSellerOrders);

// Cancel single item
router.patch("/cancel/item/:orderId/:itemId", authUser, cancelOrderItem);

// Approve & Deliver
router.patch("/update-status",authSeller, updateItemStatus);

// router.patch("/deliver/:id", authSeller, markAsDelivered);

// Admin routes
router.get("/admin", authAdmin, getAllOrders);

// Mock UPI payment
;
router.post("/create-order", authUser, createRazorpayOrder); // simulate payment
router.post("/verify-payment", authUser, verifyPayment);
router.post("/admin/pay-seller/:orderId/:itemId",authAdmin, paySeller);

// router.get("/pay/:orderId", authUser, getMockPaymentPage); // open mock gateway page

export default router;
