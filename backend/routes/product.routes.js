import express from "express";
import { 
  addProduct, 
  getProducts, 
  getProductById, 
  changeStock, 
  deleteProduct,
  restoreProduct, 
  getSellerProducts,
  getSellerProductsAll, // new
  getSellerDashboard,
  updateProduct,
  getBestSellers
} from "../controllers/product.controller.js";

import { authSeller } from "../middlewares/auth.middleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// ---------------- Seller-only routes ----------------
// Upload up to 4 images for a product
router.post("/add-product", authSeller, upload.array("images", 4), addProduct);
router.put("/:productId", authSeller,upload.array("images", 4), updateProduct);

// Change stock
router.patch("/change-stock", authSeller, changeStock);

// Soft delete product
router.patch("/delete", authSeller, deleteProduct);

// Restore product
router.patch("/restore", authSeller, restoreProduct);

// Get seller's own products (active only)
router.get("/my-products", authSeller, getSellerProducts);

// Get seller's products including deleted
router.get("/my-products-all", authSeller, getSellerProductsAll);

// Seller dashboard
router.get("/seller/dashboard", authSeller, getSellerDashboard);

// ---------------- Public routes ----------------
router.get("/", getProducts);
router.get("/list", getProducts);
router.get("/best-sellers", getBestSellers);
router.get("/:id", getProductById);



export default router;
