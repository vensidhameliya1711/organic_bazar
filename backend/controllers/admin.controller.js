import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";  
import Category from "../models/Category.js"; 

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email")
    .populate("category", "name slug");
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password"); // <-- query Seller model
    res.json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: 1 })
      .populate("userId", "name email")
      .populate("items.product", "name offerPrice images")
      .populate("items.seller", "name email")
      .sort({ createdAt: -1 });

    // Map orders to include amount text with 2% tax
    const mappedOrders = orders.map((order) => {
      // Calculate active subtotal
      const subtotal = order.items.reduce(
        (sum, i) => sum + (!i.isCancelled ? i.price * i.quantity : 0),
        0
      );
      // Apply 2% tax
      const totalAmount = +(subtotal * 1.02).toFixed(2);

      return {
        ...order.toObject(),
        totalAmountText: `₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        amount: totalAmount, // numeric value for calculations if needed
      };
    });

    res.json({ success: true, orders: mappedOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

