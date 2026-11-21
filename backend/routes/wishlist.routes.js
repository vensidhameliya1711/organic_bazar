import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", isAuthenticated, getWishlist);
router.post("/add", isAuthenticated, addToWishlist);
router.delete("/:productId", isAuthenticated, removeFromWishlist);

export default router;
