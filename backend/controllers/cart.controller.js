import User from "../models/user.model.js";

// Update Cart
export const updateCart = async (req, res) => {
  try {
    const userId = req.user?._id; // assuming auth middleware sets req.user
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { cartItems } = req.body;

    if (!Array.isArray(cartItems))
      return res.status(400).json({ success: false, message: "cartItems must be an array" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Validate items
    const validItems = cartItems
      .filter(i => i.productId && i.quantity > 0 && i.price != null)
      .map(i => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        price: Number(i.price),
      }));

    user.cartItems = validItems;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cartItems: user.cartItems,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId).populate("cartItems.productId");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, cartItems: user.cartItems || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
