


import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import WishlistButton from "../components/WishlistButton";

// 🔹 Date formatter
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SingleProduct = () => {
  const {
    products,
    navigate,
    addToCart,
    removeFromCart,
    cartItems,
    user,
    setShowUserLogin,
  } = useAppContext();

  const { id } = useParams();

  // ✅ Local product state (IMPORTANT FIX)
  const [product, setProduct] = useState(null);
  const [thumbnail, setThumbnail] = useState("/uploads/default.jpg");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // ✅ Fetch single product from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/products/${id}`
        );
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ After product loads
  useEffect(() => {
    if (!product) return;

    setThumbnail(product.images?.[0] || "/uploads/default.jpg");

    const related = (products || [])
  .filter(
    (p) => p.category === product.category && p._id !== product._id
  )
  .slice(0, 5);

    setRelatedProducts(related);

    
   }, [product, products]);

  if (!product) {
    return <p className="mt-8 text-gray-500">Loading product...</p>;
  }

  const quantityInCart = cartItems?.[product._id]?.quantity || 0;

  const getImageUrl = (img) => {
    if (!img) return "/uploads/default.jpg";
    if (img.startsWith("data:")) return img;
    if (img.startsWith("/"))
      return `http://localhost:5000${img}`;
    return `http://localhost:5000/uploads/${img}`;
  };

  // ✅ Expiry flags
  

  // ✅ Final price calculation
  const finalPrice = product.offerPrice || product.price;
  const isInactive = !product.inStock ;
  const handleAdd = () => {
    if (!user) {
      toast.error("You must be logged in to add items to cart");
      setShowUserLogin?.(true);
      return;
    }
    if (isInactive) return;
    addToCart(product);
  };

  const handleRemove = () => {
    if (quantityInCart > 0) removeFromCart(product._id);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("You must be logged in to place an order");
      setShowUserLogin?.(true);
      return;
    }
    if (isInactive) return;

    if (quantityInCart === 0) addToCart(product);

    navigate("/cart");
    scrollTo(0, 0);
  };

  // console.log("Single Page Expiry Status:", product.expiryStatus);
  // console.log("Final Price:", finalPrice);

  return (
    <main className="mt-16 max-w-7xl mx-auto px-4">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6 text-gray-600">
        <Link to="/home" className="hover:text-indigo-500">Home</Link> /{" "}
        <Link to="/products" className="hover:text-indigo-500">Products</Link> /{" "}
        <span className="text-indigo-500">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-14">
        {/* IMAGE GALLERY */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {product.images
              ?.filter((img) => img !== thumbnail)
              .map((img, i) => (
                <button
                  key={i}
                  onClick={() => setThumbnail(img)}
                  className="border border-gray-300 rounded hover:border-indigo-500"
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-20 h-20 object-cover"
                  />
                </button>
              ))}
          </div>

          <div className="relative border rounded-lg flex items-center justify-center w-[420px] h-[420px] bg-white">
            <div className="absolute top-3 right-3 z-10">
              <WishlistButton productId={product._id} />
            </div>

            <img
              src={getImageUrl(thumbnail)}
              alt={product.name}
              className="max-h-full object-contain"
            />

            {!product.inStock && (
              <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-xs rounded">
                Out of Stock
              </span>
            )}

            
          
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          {/* PRICE */}
         <div className="mt-4 space-y-2">
  <p className="text-gray-500 line-through">
    MRP: ₹{product.price}
  </p>

  {product.offerPrice ? (
    <p className="text-2xl font-bold text-green-600">
      Offer Price: ₹{product.offerPrice}
    </p>
  ) : (
    <p className="text-2xl font-bold text-green-600">
      Price: ₹{product.price}
    </p>
  )}
</div>

<div className="mt-2">
  {product.unit_pack_kg && (
    <p className="text-gray-700">
      <b>Unit Pack:</b> {product.unit_pack_kg} kg
    </p>
  )}
  </div>
          {/* DETAILS */}
          <div className="mt-6 space-y-3 text-gray-700">
  <p><b>Category:</b> {product.category?.name}</p>

  {product.description && (
    <p><b>Description:</b> {product.description}</p>
  )}

 
  

  {/* ✅ SELLER DETAILS CARD */}
  {product.seller && (
    <div className="mt-6 border border-emerald-200 rounded-xl p-5 bg-emerald-50 shadow-sm">

      <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center gap-2">
        🌿 Seller Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Seller Name */}
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-xs text-gray-500">Farmer Name</p>
          <p className="font-medium text-gray-800">
            {product.seller.name}
          </p>
        </div>

        {/* Farm Name */}
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-xs text-gray-500">Farm Name</p>
          <p className="font-medium text-gray-800">
            {product.seller.farmName || "N/A"}
          </p>
        </div>

        {/* Email */}
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-xs text-gray-500">Email</p>
          <p className="font-medium text-gray-800">
            {product.seller.email}
          </p>
        </div>

        {/* Phone */}
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-xs text-gray-500">Phone</p>
          <p className="font-medium text-gray-800">
            {product.seller.phone}
          </p>
        </div>

        {/* Address Full Width */}
        <div className="bg-white p-3 rounded-lg border md:col-span-2">
          <p className="text-xs text-gray-500">Farm Address</p>
          <p className="font-medium text-gray-800">
            {product.seller.address}
          </p>
        </div>

      </div>
    </div>
  )}

</div>


          {/* CART ACTIONS */}
          <div className="flex items-center gap-4 mt-10">
            {quantityInCart === 0 ? (
              <button
                onClick={handleAdd}
                disabled={isInactive}
                className={`w-full py-3 rounded font-medium ${
                  isInactive
                    ? "bg-gray-200 opacity-50 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex w-full items-center justify-between border rounded px-4 py-2 bg-gray-100">
                <button onClick={handleRemove} disabled={isInactive}>−</button>
                <span>{quantityInCart}</span>
                <button onClick={handleAdd} disabled={isInactive}>+</button>
              </div>
            )}

            <button
              onClick={handleBuyNow}
              disabled={isInactive}
              className={`w-full py-3 rounded font-medium text-white ${
                isInactive
                  ? "bg-gray-400 opacity-50 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <section className="mt-24 text-center">
        <h2 className="text-2xl font-semibold mb-6">Related Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default SingleProduct;
