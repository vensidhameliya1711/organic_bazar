import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Category from "../models/Category.js";
import fs from "fs";
import path from "path";



// ---------------- Add Product (seller only) ----------------
export const addProduct = async (req, res) => {
  try {
    const sellerId = req.session?.user?._id;

    if (!sellerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // ✅ GET DATA (IMPORTANT 🔥)
    const {
      name,
      price,
      offerPrice,
      unit_pack_kg,
      stock_kg,
     
      unitType,   // 🔥 ADD THIS
      stockType,  // 🔥 ADD THIS
      description,
      category,
    } = req.body;

    // ✅ VALIDATION
    if (
      !name ||
      !price ||
      !offerPrice ||
      !unit_pack_kg ||
      !stock_kg ||
     
      !unitType ||
      !stockType ||
      !description ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (Number(offerPrice) >= Number(price)) {
      return res.status(400).json({
        success: false,
        message: "Offer Price must be less than Price",
      });
    }

    // ✅ 🔥 CONVERT TO KG (MAIN FIX)
    const finalUnitPack =
      unitType === "g"
        ? Number(unit_pack_kg) / 1000
        : Number(unit_pack_kg);

    const finalStock =
      stockType === "g"
        ? Number(stock_kg) / 1000
        : Number(stock_kg);

    // ✅ EXTRA VALIDATION
    if (finalUnitPack <= 0 || finalStock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit or stock value",
      });
    }

    // ✅ FIND CATEGORY
    const categoryData = await Category.findOne({ name: category });

    if (!categoryData) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // ✅ IMAGES
    const images = req.files.map((file) => file.filename);

    // ✅ AUTO STOCK STATUS
    const inStock = finalStock > 0;

    // ✅ CREATE PRODUCT
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      offerPrice: Number(offerPrice),
      unit_pack_kg: finalUnitPack,
      stock_kg: finalStock,
      original_stock_kg: finalStock, // 🔥 FIX
      inStock, // 🔥 AUTO

      category: categoryData._id,
      images,
      seller: sellerId,
    });

    res.status(201).json({
      success: true,
      message: "✅ Product added successfully",
      product,
    });

  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const sellerId = req.session?.user?._id;

    if (!sellerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.seller.equals(sellerId)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own products",
      });
    }

    const {
      name,
      price,
      offerPrice,
      unit_pack_kg,
      addedStock,   // 🔥 NEW FIELD (frontend se)
      description,
      category,
    } = req.body;

    // ✅ NORMAL FIELDS
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();

    if (price !== undefined) product.price = Number(price);
    if (offerPrice !== undefined) product.offerPrice = Number(offerPrice);
    if (unit_pack_kg !== undefined) product.unit_pack_kg = Number(unit_pack_kg);

    // 🔥 STOCK LOGIC (IMPORTANT)
    if (addedStock !== undefined && Number(addedStock) > 0) {
      const addQty = Number(addedStock);

      product.stock_kg += addQty;
      product.original_stock_kg += addQty;

      product.inStock = true;
    }

    // 🔥 CATEGORY FIX
    if (category) {
      const categoryData = await Category.findById(category);

      if (!categoryData) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }

      product.category = categoryData._id;
    }

    // ✅ PRICE VALIDATION
    if (
      product.offerPrice !== undefined &&
      product.price !== undefined &&
      product.offerPrice >= product.price
    ) {
      return res.status(400).json({
        success: false,
        message: "Offer Price must be less than Price",
      });
    }

    // ✅ IMAGE UPDATE
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => file.filename);
    }

    const savedProduct = await product.save();

    await savedProduct.populate("category", "name");

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      product: savedProduct,
    });

  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: 1 })
      .populate("seller", "name email phone farmName address")
      .populate("category", "name slug"); 

    // const mappedProducts = products.map((p) => {
    //   const { status, daysLeft } = getExpiryStatus(p.ExpiryDate);

    //   return {
    //     ...p.toObject(),
    //     expiryStatus: status,
    //     daysLeft,
    //   };
    // });

    res.status(200).json({
      success: true,
       products
      
    });

  } catch (error) {
    console.error("❌ Error in getProducts:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      isDeleted: 1
    }).populate("seller", "name email phone farmName address")
    .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
       
      },
    });

  } catch (error) {
    console.error("❌ Error in getProductById:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};





export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.session?.user?._id;
    if (!sellerId)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const products = await Product.find({ seller: sellerId, isDeleted: 1 });

    // const mappedProducts = products.map((p) => {
    //   const { status, daysLeft } = getExpiryStatus(p.ExpiryDate);

    //   return {
    //     ...p.toObject(),
    //     expiryStatus: status,
    //     daysLeft,
    //   };
    // });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("❌ Error in getSellerProducts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getSellerProductsAll = async (req, res) => {
  try {
    const sellerId = req.session?.user?._id;

    if (!sellerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const products = await Product.find({ seller: sellerId })
      .populate("category", "name slug"); // ✅ FIX

    res.status(200).json({
      success: true,
      products,
    });

  } catch (error) {
    console.error("❌ Error in getSellerProductsAll:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const changeStock = async (req, res) => {
  try {
    const sellerId = req.session?.user?._id;
    const { productId, inStock } = req.body;

    const product = await Product.findOne({
      _id: productId,
      seller: sellerId,
      isDeleted: 1,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.inStock = inStock;
    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




// ---------------- Soft delete product (seller only) ----------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const sellerId = req.session?.user?._id;

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: sellerId, isDeleted: 1 },
      { isDeleted: 0 },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "🗑️ Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error in deleteProduct:", error);
    res.status(500).json({ success: false, message: "Server error while deleting product" });
  }
};




export const restoreProduct = async (req, res) => {
  try {
    const sellerId = req.session?.user?._id;
    const role = req.session?.user?.role;

    if (!sellerId || role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const { id } = req.body;

    // 🔹 Step 1: find product first
    const product = await Product.findOne({
      _id: id,
      seller: sellerId,
      isDeleted: 0,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    
    

    // 🔹 Step 3: restore product
    product.isDeleted = 1;
    await product.save();

    res.status(200).json({
      success: true,
      message: "♻️ Product restored successfully",
      product,
    });

  } catch (error) {
    console.error("❌ Error in restoreProduct:", error);
    res.status(500).json({
      success: false,
      message: "Server error while restoring product",
    });
  }
};


export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.session?.user?._id;

    if (!sellerId || req.session.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    // 🟢 Get seller active products
    const products = await Product.find({
  seller: sellerId,
  isDeleted: 1,
})
  .populate("category", "name slug")   // ✅ ADD THIS
  .populate("seller", "name email");  // optional but good
    
    // =============================
    // ORDERS
    // =============================

   const orders = await Order.find({
  "items.seller": sellerId,
})
  .populate({
    path: "items.product",
    select: "name category price offerPrice",
    populate: {
      path: "category",
      select: "name slug"
    }
  })
  .populate("userId", "name email")
  .sort({ createdAt: -1 });



      const totalProducts = products.length;

const totalinStock = products.filter(p => p.inStock === true).length;

const totalOutofStock = products.filter(p => p.inStock === false).length;

const totalDeleted = await Product.countDocuments({
  seller: sellerId,
  isDeleted: 0,
});
    // =============================
    // RESPONSE
    // =============================

    res.status(200).json({
      success: true,

      products,
      orders,

  
      // counts for cards
      stats: {
        totalProducts,
        totalinStock,
        totalOutofStock,
        totalDeleted, 
       
      },

    });

  } catch (error) {
    console.error("Seller Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getBestSellers = async (req, res) => {
  try {

    const products = await Product.find({
      isDeleted: 1,
      orderCount: { $gt: 0 }
    })
    .populate("category", "name slug")   // ✅ ADD THIS
      .sort({ orderCount: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      products
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch best sellers"
    });

  }
};