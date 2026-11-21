import mongoose from "mongoose";

// ---------------- Item Sub-Schema ----------------
const itemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },  
    // ---------------- Item Status ----------------
    status: {
  type: String,
  default: "Order Placed",
  enum: [
    "Order Placed",
    "Approved by Seller",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled by User"
  ],
},


    isCancelled: {
      type: Boolean,
      default: false,
    },

    // ---------------- Seller Earnings ----------------
    sellerAmount: {
      type: Number,
      default: 0,
    },

    adminCommission: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    finalTotal: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    payout: {
  isPaidToSeller: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
    default: null,
  },
},

  },
  { _id: true }
);

// ---------------- Main Order Schema ----------------
const orderSchema = new mongoose.Schema(
  {
    // ---------------- User Info ----------------
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [itemSchema],

    // ---------------- Order Amount ----------------
    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    // ---------------- Order Status ----------------
    status: {
  type: String,
  default: "Order Placed",
  enum: [
    "Order Placed",
    "Approved by Seller",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled by User"
  ],
},


    // ====================================================
    // PAYMENT SECTION (FULL RAZORPAY SUPPORT)
    // ====================================================

    paymentType: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },

    // Razorpay Order ID
    razorpayOrderId: {
      type: String,
      default: null,
    },

    // Razorpay Payment ID
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // Razorpay Signature (IMPORTANT for verification)
    razorpaySignature: {
      type: String,
      default: null,
    },

   

    

    // ====================================================
    // SOFT DELETE
    // ====================================================

    isDeleted: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ====================================================
// AUTO CALCULATE TAX + COMMISSION + SELLER AMOUNT
// ====================================================

orderSchema.pre("save", function (next) {
  if (this.isModified("items") || this.isNew) {
    const taxRate = 0.02;
    const commissionRate = 0.1;

    let orderSubtotal = 0;

    this.items = this.items.map((item) => {
      const itemSubtotal = item.price * item.quantity;

      const itemTax = +(itemSubtotal * taxRate).toFixed(2);

      const itemFinalTotal = +(itemSubtotal + itemTax).toFixed(2);

      item.adminCommission = +(itemSubtotal * commissionRate).toFixed(2);

      item.sellerAmount = +(itemSubtotal - item.adminCommission).toFixed(2);

      item.tax = itemTax;

      item.finalTotal = itemFinalTotal;

      orderSubtotal += itemFinalTotal;

      return item;
    });

    this.amount = +orderSubtotal.toFixed(2);
  }

  next();
});

// ====================================================
// SOFT DELETE METHOD
// ====================================================

orderSchema.methods.softDelete = function () {
  this.isDeleted = 0;
  this.deletedAt = new Date();
  return this.save();
};

// ====================================================
// EXPORT
// ====================================================

const Order = mongoose.model("Order", orderSchema);

export default Order;
