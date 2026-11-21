import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";


const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ---------------- STATES ---------------- */
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");


  



/* ---------------- WISHLIST ---------------- */
/* AppContext.jsx - Wishlist part */
const fetchWishlist = async () => {
  try {
    const { data } = await api.get("/api/wishlist");
    setWishlist(data.wishlist || []); // full product objects
  } catch (err) {
    console.error("fetchWishlist error:", err);
  }
};

const addToWishlist = async (productId) => {
  try {
    setLoading(true);
    const { data } = await api.post("/api/wishlist/add", { productId });
    setWishlist(data.wishlist); // full products
    toast.success("Added to wishlist ❤️");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to add to wishlist");
  } finally {
    setLoading(false);
  }
};

const removeFromWishlist = async (productId) => {
  try {
    const { data } = await api.delete(`/api/wishlist/${productId}`);
    setWishlist(data.wishlist); // full products
    toast.success("Removed from wishlist ❌");
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove from wishlist");
  }
};

const isInWishlist = (id) => wishlist.some((item) => item._id === id); // check properly


// 🔹 Check if product is in wishlist


// Fetch wishlist on load if user is logged in
useEffect(() => {
  if (localStorage.getItem("token")) {
    fetchWishlist();
  }
}, []);


 
  const normalizeUserData = (rawUser) => {
  if (!rawUser) return null;

  const normalizedCart = (rawUser.cartItems || []).reduce((acc, item) => {
    if (!item.productId) return acc;
    acc[item.productId._id] = {
      quantity: Number(item.quantity) || 0,
      price: item.price ?? item.productId.offerPrice,
    };
    return acc;
  }, {});

  return {
    ...rawUser,
    cartItems: normalizedCart,
    profile: rawUser.profile || null, // ✅ ONLY filename
  };
};


  const getProductImage = (product) => {
    if (!product?.images?.length)
      return `${backendURL}/uploads/default.jpg`;
    return `${backendURL}/uploads/${product.images[0]}`;
  };


  
  
// Add to cart
const addToCart = async (product) => {
  if (!user) return toast.error("Please login first");

  const productId = product._id;
  const price = product.offerPrice || product.price;

  // Optimistic update
  const updatedCart = { ...cartItems };
  const prevQty = updatedCart[productId]?.quantity || 0;
  updatedCart[productId] = { quantity: prevQty + 1, price };
  setCartItems(updatedCart);

  try {
    const cartArray = Object.entries(updatedCart).map(([pid, item]) => ({
      productId: pid,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data } = await api.post("/api/cart/update", {
      cartItems: cartArray,
    });

    if (data.success) {
      // ✅ DO NOT overwrite cart unless backend actually sends it
      toast.success("Added to cart");
    } else {
      setCartItems(cartItems); // rollback
      toast.error(data.message || "Failed to add to cart");
    }
  } catch (err) {
    console.error(err);
    setCartItems(cartItems); // rollback
    toast.error("Failed to add to cart");
  }
};


// Fetch cart
const fetchCart = async () => {
  try {
    const { data } = await api.get("/api/cart/get");
    if (data.success) {
      const cartObj = {};
      data.cartItems.forEach(item => {
        const pid = item.productId?._id || item.productId;
        cartObj[pid] = { quantity: item.quantity, price: item.price };
      });
      setCartItems(cartObj);
    }
  } catch (err) {
    console.error("Failed to fetch cart", err);
  }
};

// Remove from cart
const removeFromCart = async (productId) => {
  try {
    const updatedCart = { ...cartItems };

    if (!updatedCart[productId]) return;

    // 🔹 Decrease quantity OR remove
    if (updatedCart[productId].quantity > 1) {
      updatedCart[productId] = {
        ...updatedCart[productId],
        quantity: updatedCart[productId].quantity - 1,
      };
    } else {
      delete updatedCart[productId];
    }

    const cartArray = Object.entries(updatedCart).map(([pid, item]) => ({
      productId: pid,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data } = await api.post("/api/cart/update", {
      cartItems: cartArray,
    });

    if (data.success) {
      setCartItems(updatedCart); // ✅ update after backend success
      toast.success("Removed from cart");
    }

  } catch (err) {
    console.error(err);
    toast.error("Failed to update cart");
  }
};



// Load cart in useEffect



  /* ---------------- CART COUNT ---------------- */
   const cartCount = () =>
    Object.values(cartItems || {}).reduce((sum, item) => sum + item.quantity, 0);
 

/*---------------whishList-------------------*/


  /* ---------------- LOGIN ---------------- */
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password,
      });

      if (!data.success) {
        toast.error(data.message || "Login failed");
        return null;
      }

      const normalizedUser = normalizeUserData(data.user);
      setUser(normalizedUser);
      setCartItems(normalizedUser.cartItems || {});
      toast.success("Login successful");

      if (normalizedUser.role === "admin") navigate("/admin/dashboard");
      else if (normalizedUser.role === "seller") navigate("/seller");
      else navigate("/home");

      return normalizedUser;
    } catch (err) {
      toast.error("Server error");
      return null;
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      setCartItems({});
      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
  const init = async () => {
    try {
      const { data } = await api.get("/api/auth/check");

      if (data.success && data.user) {
        const normalizedUser = normalizeUserData(data.user);
        setUser(normalizedUser);

        // 🔹 Load cart from backend
        setCartItems(normalizedUser.cartItems || {});

        // 🔹 Load wishlist from backend
         if (normalizedUser && normalizedUser.role === "user") {
      fetchCart();
   }
        //  await fetchCart();
        await fetchWishlist();
      }

      const productsRes = await api.get("/api/products");
      if (productsRes.data.success) {
        setProducts(productsRes.data.products);
        // console.log(data.products); // check seller here
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  init();
}, []); // ✅ Added user dependency to refetch wishlist when user changes



  /* ---------------- ADD PRODUCT (SELLER) ---------------- */
  const addProduct = async (productData) => {
    if (!user || user.role !== "seller") {
      toast.error("Only sellers can add products");
      return null;
    }

    try {
      const { data } = await api.post(
        "/api/products/add-product",
        productData
      );

      if (data.success) {
        setProducts((prev) => [...prev, data.product]);
        toast.success("Product added");
      } else {
        toast.error(data.message);
      }

      return data;
    } catch (err) {
      toast.error("Add product failed");
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        
    user,
    setUser,
    loading,
    // axios: api, 
     
    navigate,            // ✅ FIXED
    products,
    setProducts,
    api,
    cartItems,
    fetchCart,
   
    setCartItems,
    addToCart,
    removeFromCart,
    cartCount,
    searchQuery,
    setSearchQuery,
    login,
    logout,
    getProductImage,
    wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
    addProduct,

      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
