import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";

import razorpay from "../config/razorpay.js";
import User from "../models/user.model.js"; 


export const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { items, addressId, paymentType } = req.body;

    if (!addressId || !items?.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid order details",
      });
    }

    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    let orderItems = [];
    let totalAmount = 0;

    // 🔥 LOOP START
    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) throw new Error("Product not found");

      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.price ?? product.offerPrice ?? product.price ?? 0);

      // 🔥 STEP 1: CALCULATE TOTAL WEIGHT
      const totalWeight = product.unit_pack_kg * quantity;

      // 🔥 STEP 2: CHECK STOCK
      if (product.stock_kg < totalWeight) {
        throw new Error(`${product.name} is out of stock`);
      }

      // 🔥 STEP 3: DECREASE STOCK
      product.stock_kg -= totalWeight;

      // 🔥 STEP 4: UPDATE STOCK STATUS
      product.inStock = product.stock_kg > 0;

      await product.save();

      // 🔥 CALCULATIONS
      const subtotal = parseFloat((unitPrice * quantity).toFixed(2));
      const tax = parseFloat((subtotal * 0.02).toFixed(2));
      const finalTotal = parseFloat((subtotal + tax).toFixed(2));

      const adminCommission = parseFloat((subtotal * 0.1).toFixed(2));
      const sellerAmount = parseFloat((subtotal - adminCommission).toFixed(2));

      totalAmount += finalTotal;

      // 🔥 ORDER ITEM
      orderItems.push({
        product: product._id,
        seller: product.seller,
        quantity,
        price: unitPrice,
        subtotal,
        tax,
        finalTotal,
        adminCommission,
        sellerAmount,
        status: "Order Placed",
        isCancelled: false,
        createdAt: new Date(),
      });

      // 🔥 ORDER COUNT UPDATE
      await Product.findByIdAndUpdate(product._id, {
        $inc: { orderCount: quantity },
      });
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // 🔥 CREATE ORDER
    const newOrder = await Order.create({
      userId,
      items: orderItems,
      amount: totalAmount,
      addressId,
      paymentType: paymentType === "ONLINE" ? "ONLINE" : "COD",
      isPaid: false,
      paymentStatus: "Pending",
      status: "Order Placed",
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });

  } catch (error) {
    console.error("Place Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    if (req.session.user?.role !== "admin")
      return res.status(403).json({ success: false, message: "Admins only" });

    const orders = await Order.find({ isDeleted: 1 })
      .populate("items.product", "name offerPrice images category")
      .populate("userId", "name email")
      .populate("addressId")
      .sort({ createdAt: -1 });

    // Add commission & payout info for admin dashboard
    const ordersWithCommission = orders.map((order) => {
      const totalAdminCommission = order.items.reduce(
        (sum, item) => sum + (item.adminCommission || 0),
        0
      );

      const totalSellerPayout = order.items.reduce(
        (sum, item) =>
          sum + (item.isCancelled ? 0 : item.sellerAmount || 0),
        0
      );

      return {
        ...order.toObject(),
        totalAdminCommission,
        totalSellerPayout,
      };
    });

    res.status(200).json({ success: true, orders: ordersWithCommission });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.session.user?._id;
    if (!sellerId || req.session.user?.role !== "seller")
      return res.status(401).json({ success: false, message: "Unauthorized seller" });

    let orders = await Order.find({ "items.seller": sellerId, isDeleted: 1 })
      .populate("items.product", "name images category offerPrice")
      .populate("userId", "name email")
      .populate("addressId")
      .sort({ createdAt: -1 });

    orders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (i) => i.seller.toString() === sellerId.toString()
      );

      const subtotal = sellerItems.reduce(
        (sum, i) => sum + (!i.isCancelled ? i.price * i.quantity : 0),
        0
      );

      const sellerPayout = sellerItems.reduce(
        (sum, i) => sum + (!i.isCancelled ? i.sellerAmount || 0 : 0),
        0
      );

      const adminCommission = sellerItems.reduce(
        (sum, i) => sum + (i.adminCommission || 0),
        0
      );

      return {
        ...order.toObject(),
        items: sellerItems,
        amount: Math.round(subtotal * 1.02), // original total with tax
        sellerPayout, // amount seller will receive
        adminCommission, // admin's share from this seller
      };
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get Seller Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getUserOrders = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({ userId, isDeleted: 1 })
      .populate("items.product", "name images category ")
      .populate("addressId")
      .sort({ createdAt: -1 });

    // ❌ NO recalculation here
    // ✅ DB amount is final truth
    const mappedOrders = orders.map((order) => ({
      ...order.toObject(),
    }));

    res.status(200).json({
      success: true,
      orders: mappedOrders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ---------------- Cancel Single Item ----------------
export const cancelOrderItem = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const { orderId, itemId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId, isDeleted: 1 });
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const item = order.items.id(itemId);
    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });

    if (item.isCancelled)
      return res.status(400).json({ success: false, message: "Item already cancelled" });

    if (order.paymentType === "ONLINE" && order.paymentStatus === "Success") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel item after online payment",
      });
    }

    // 🔥 STEP 1: FIND PRODUCT
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product not found");

    // 🔥 STEP 2: CALCULATE RETURN WEIGHT
    const returnWeight = product.unit_pack_kg * item.quantity;

    // 🔥 STEP 3: ADD BACK STOCK
    product.stock_kg += returnWeight;

    // 🔥 STEP 4: UPDATE STOCK STATUS
    product.inStock = true;

    await product.save();

    // 🔥 STEP 5: CANCEL ITEM
    item.isCancelled = true;
    item.status = "Cancelled by User";

    // 🔥 RE-CALCULATE ORDER
    let subtotal = 0;
    let totalSellerAmount = 0;
    let totalAdminCommission = 0;

    order.items.forEach((i) => {
      if (!i.isCancelled) {
        subtotal += i.price * i.quantity;

        const commission = Math.round(i.price * 0.1 * i.quantity);
        totalAdminCommission += commission;

        totalSellerAmount += i.price * i.quantity - commission;

        i.adminCommission = commission;
        i.sellerAmount = i.price * i.quantity - commission;
      }
    });

    order.amount = +(subtotal * 1.02).toFixed(2);
    order.totalAdminCommission = totalAdminCommission;
    order.totalSellerPayout = totalSellerAmount;

    if (order.items.every((i) => i.isCancelled)) {
      order.status = "Cancelled by User";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Item cancelled successfully",
      order,
    });

  } catch (error) {
    console.error("Cancel Order Item Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateItemStatus = async (req, res) => {
  try {

    const sellerId = req.session.user?._id;
    const { orderId, newStatus, status } = req.body;

    const finalStatus = newStatus || status;

    if (!sellerId || req.session.user?.role !== "seller")
      return res.status(401).json({
        success: false,
        message: "Unauthorized seller"
      });

    if (!orderId || !finalStatus)
      return res.status(400).json({
        success: false,
        message: "Missing orderId or status"
      });

    const order = await Order.findOne({
      _id: orderId,
      "items.seller": sellerId,
    });

    if (!order)
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });

    const flow = {
      "Order Placed": "Approved by Seller",
      "Approved by Seller": "Packed",
      "Packed": "Shipped",
      "Shipped": "Out for Delivery",
      "Out for Delivery": "Delivered"
    };

    let updated = false;

    order.items.forEach(item => {

      if (
        !item.isCancelled &&
        item.seller.toString() === sellerId.toString()
      ) {

        // ✅ 🚨 IMPORTANT VALIDATION FOR ONLINE PAYMENT
        if (
          finalStatus === "Approved by Seller" &&
          order.paymentType === "ONLINE" &&
          order.paymentStatus !== "Success"
        ) {
          throw new Error(
            "Cannot approve order. Payment not completed yet."
          );
        }

        // Normal flow validation
        if (flow[item.status] !== finalStatus)
          throw new Error("Invalid status transition");

        item.status = finalStatus;
        updated = true;

        // Commission calculation
        if (finalStatus === "Approved by Seller") {

          const commission = Math.round(item.price * 0.1 * item.quantity);

          item.adminCommission = commission;
          item.sellerAmount =
            item.price * item.quantity - commission;
        }

        // COD payment success when delivered
        if (finalStatus === "Delivered" && order.paymentType === "COD") {

          item.isPaidToSeller = true;
          order.isPaid = true;
          order.paymentStatus = "Success";
        }
      }
    });

    if (!updated)
      return res.status(400).json({
        success: false,
        message: "No items updated"
      });

    const priority = [
      "Order Placed",
      "Approved by Seller",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered"
    ];

    order.status = order.items.reduce(
      (prev, curr) =>
        priority.indexOf(curr.status) > priority.indexOf(prev)
          ? curr.status
          : prev,
      "Order Placed"
    );

    await order.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      order
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const createRazorpayOrder = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "OrderId required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ prevent duplicate payment
    if (order.paymentStatus === "Success") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    // ✅ amount already includes tax
    const amount = Math.round(order.amount * 100);

    const options = {
      amount,
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // ✅ save razorpay order id
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("RAZORPAY ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

   

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ prevent duplicate verification
    if (order.paymentStatus === "Success") {
      return res.json({
        success: true,
        message: "Already verified",
      });
    }

    // ✅ verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {

      order.paymentStatus = "Failed";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // ✅ PAYMENT SUCCESS

    order.paymentStatus = "Success";
    order.isPaid = true;

    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    

    // ✅ save payment details
    order.paymentDetails = {
      method: "ONLINE",
      amount: order.amount,
      txId: razorpay_payment_id,
      paidAt: new Date(),
      note: "Paid via Razorpay",
    };

    await order.save();

    console.log("✅ Payment verified & saved");

    res.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (err) {

    console.error("VERIFY ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const paySeller = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "Success") {
      return res.status(400).json({ message: "Payment not successful yet" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.payout?.isPaidToSeller) {
      return res.status(400).json({ message: "Already paid to seller" });
    }

    const seller = await User.findById(item.seller);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Add to wallet
    seller.wallet = (seller.wallet || 0) + item.sellerAmount;

    item.payout = {
      isPaidToSeller: true,
      paidAt: new Date(),
    };

    await seller.save();
    await order.save();

    res.json({
      success: true,
      message: "Seller paid successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};