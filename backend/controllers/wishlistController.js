// controllers/wishlistController.js
import Wishlist from "../models/Wishlist.js";
import mongoose from "mongoose";



export const getWishlist = async (req, res) => {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser)
      return res.status(401).json({ success: false, message: "Not logged in" });

    // 🔹 Skip wishlist query if _id is not a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionUser._id)) {
      // Admin or invalid _id → return empty wishlist
      return res.json({ success: true, wishlist: [] });
    }

    // Normal user → find wishlist
    const wishlist = await Wishlist.findOne({ user: sessionUser._id }).populate("products");

    res.json({
      success: true,
      wishlist: wishlist ? wishlist.products : [], // ✅ full product objects
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const addToWishlist = async (req, res) => {
  try {
    const sessionUser = req.session.user;
    const { productId } = req.body;

    if (!sessionUser)
      return res.status(401).json({ success: false, message: "Not logged in" });

    if (!productId)
      return res.status(400).json({ success: false, message: "Product ID required" });

    let wishlist = await Wishlist.findOne({ user: sessionUser._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: sessionUser._id,
        products: [productId],
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();

    // Populate products before sending
    await wishlist.populate("products");

    res.status(201).json({
      success: true,
      wishlist: wishlist.products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const sessionUser = req.session.user;
    const { productId } = req.params;

    if (!sessionUser)
      return res.status(401).json({ success: false, message: "Not logged in" });

    const wishlist = await Wishlist.findOne({ user: sessionUser._id });
    if (!wishlist)
      return res.status(404).json({ success: false, message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    await wishlist.populate("products");

    res.json({
      success: true,
      wishlist: wishlist.products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
