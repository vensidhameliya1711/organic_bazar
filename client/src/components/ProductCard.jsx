

// src/components/ProductCard.jsx
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import WishlistButton from "./WishlistButton";

const ProductCard = ({ product }) => {
  const {
    addToCart,
    removeFromCart,
    cartItems,
    navigate,
    user,
    setShowUserLogin,
  } = useAppContext();

  if (!product) return null;

  

  const handleNavigate = () => {
   navigate(
  `/product/${product.category?.slug}/${product._id}`
);
    window.scrollTo(0, 0);
  };

  const inCart = cartItems?.[product._id];
  const quantityInCart = inCart?.quantity || 0;

  const handleAdd = (e) => {
    e.stopPropagation();

    if (!user) {
      toast.error("You must be logged in to add items to cart");
      setShowUserLogin?.(true);
      return;
    }

    if (!product.inStock ) return;

    addToCart(product);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (quantityInCart > 0) removeFromCart(product._id);
  };

  const getProductImage = () => {
    if (!product.images || product.images.length === 0)
      return "http://localhost:5000/uploads/default.jpg";

    const img = product.images[0];
    return img.startsWith("data:")
      ? img
      : `http://localhost:5000/uploads/${img}`;
  };

  // 💰 Price logic
  const finalPrice = product.offerPrice || product.price;
  return (
    <div
      onClick={handleNavigate}
      className="relative border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full cursor-pointer"
    >
      {/* ❤️ Wishlist */}
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton productId={product._id} />
      </div>

      {/* 🖼 IMAGE */}
      <div className="group flex items-center justify-center px-2 relative">
        <img
          className="group-hover:scale-105 transition max-w-26 md:max-w-36 object-cover"
          src={getProductImage()}
          alt={product.name}
          onError={(e) =>
            (e.target.src = "http://localhost:5000/uploads/default.jpg")
          }
        />

        {/* 🟥 Out of Stock */}
        {!product.inStock && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded z-20">
            Out of Stock
          </span>
        )}

        </div>

      {/* ℹ️ INFO */}
      <div className="text-gray-500/60 text-sm mt-2">
        <p>{product.category?.name || "General" }</p>
        <p className="text-gray-700 font-medium text-lg truncate">
          {product.name}
        </p>

        {/* 💰 PRICE & CART */}
        <div className="flex items-end justify-between mt-3">
          <p className="md:text-xl text-base font-medium text-indigo-500">
  ₹{finalPrice}
</p>
          {quantityInCart === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!product.inStock }
              className={`flex items-center gap-1 px-3 py-1 border rounded text-indigo-600 ${
                !product.inStock 
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <img src={assets.cart_icon} alt="cart" />
              Add
            </button>
          ) : (
            <div className="flex gap-2 bg-indigo-100 px-2 py-1 rounded">
              <button onClick={handleRemove}>-</button>
              <span>{quantityInCart}</span>
              <button
                onClick={handleAdd}
                disabled={!product.inStock }
                className={
                  !product.inStock 
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
