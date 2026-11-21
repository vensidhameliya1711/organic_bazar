import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";

const WishlistButton = ({ productId }) => {
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading,
  } = useAppContext();

  const inWishlist = isInWishlist(productId);

  const handleClick = (e) => {
    e.stopPropagation(); // ✅ card click prevent
    if (loading) return;

    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label="Wishlist"
      className={`
        w-10 h-10 flex items-center justify-center
        rounded-full border
        transition-all duration-300
        ${
          inWishlist
            ? "bg-red-50 border-red-200 hover:bg-red-100"
            : "bg-white border-gray-200 hover:border-red-300"
        }
        hover:scale-110 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {inWishlist ? (
        <FaHeart className="text-red-500 text-lg animate-pulse" />
      ) : (
        <FaRegHeart className="text-gray-400 text-lg hover:text-red-400" />
      )}
    </button>
  );
};

export default WishlistButton;
