import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
   description: {
  type: String,
  required: true,
  trim: true,
},

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    offerPrice: {
      type: Number,
      required: true,
      min: [0, "Offer Price cannot be negative"],
    },
    unit_pack_kg: {
    type: Number,   // 0.1 = 100g
    required: true
  },
  stock_kg: {
    type: Number,   // total stock in kg
    required: true
  },
 
  original_stock_kg: {
    type: Number,   // original stock in kg (for reference)
    required: true
  },
    images: {
      type: [String],
      required: true,
    },
 category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  required: true,
},
    inStock: {
      type: Boolean,
      default: true,
    },

    // ✅ FK to User (must be a seller)
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
//order count field
     orderCount: {
      type: Number,
      default: 0
    },
    // ✅ Soft delete fields
    isDeleted: {
      type: Number,
      enum: [0, 1], // 1 = active, 0 = deleted
      default: 1,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔹 Soft delete method
productSchema.methods.softDelete = function () {
  this.isDeleted = 0;
  this.deletedAt = new Date();
  return this.save();
};

// ✅ Validate seller role before saving
productSchema.pre("save", async function (next) {
  try {
    const User = mongoose.model("User");
    const sellerDoc = await User.findById(this.seller);

    if (!sellerDoc || sellerDoc.role !== "seller") {
      throw new Error("Invalid seller: must be a user with role 'seller'");
    }

    // Offer Price should be less than price
    if (this.offerPrice >= this.price) {
      throw new Error("Offer Price must be less than Price");
    }

    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Auto-populate seller info on find queries
productSchema.pre(/^find/, function (next) {
  this.populate({ path: "seller", select: "name email farmName phone address" });
  next();
});

// ✅ Indexing for faster queries
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });

// ✅ Fix OverwriteModelError
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
