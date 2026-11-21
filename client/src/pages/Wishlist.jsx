


import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { wishlist, removeFromWishlist, getProductImage } = useAppContext();
  const navigate = useNavigate();

  if (!wishlist.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <span className="text-4xl mb-3">💔</span>
        <p className="text-lg font-medium">Your wishlist is empty</p>
        <p className="text-sm">Save items you love here</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">My Wishlist</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          
          const isOutOfStock = !item.inStock;
          const isInactive = isOutOfStock;

        

          return (
            <div
              key={item._id}
              className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition group"
            >
              {/* 🖼 Image */}
              <div
                className="relative h-52 bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden rounded-t-xl"
                onClick={() =>
                  navigate(`/product/${item.category}/${item._id}`)
                }
              >
                <img
                  src={getProductImage(item)}
                  alt={item.name}
                  className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges Container */}
{/* Badges Container */}
<div className="absolute top-3 left-3 flex gap-2">

  {/* Out of Stock Badge */}
  {isOutOfStock && (
    <span className="bg-red-500 text-white px-2 py-1 text-xs rounded">
      Out of Stock
    </span>
  )}

</div>

                {/* ❤️ Remove from wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item._id);
                  }}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition"
                  title="Remove from wishlist"
                >
                  ❤️
                </button>
              </div>

              {/* ℹ️ Content */}
              <div className="p-4">
                <h3
                  className="font-medium text-gray-800 truncate cursor-pointer hover:text-green-600"
                  onClick={() =>
                    navigate(`/product/${item.category}/${item._id}`)
                  }
                >
                  {item.name}
                </h3>

                <p className="text-green-600 font-semibold mt-1">
                  ₹{item.offerPrice || item.price}
                </p>

                <button
                  onClick={() =>
                   navigate(`/product/${item.category?.slug}/${item._id}`)
                  }
                  disabled={isInactive}
                  className={`mt-4 w-full border py-2 rounded-lg font-medium transition
                    ${
                      isInactive
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                        : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    }
                  `}
                >
                 {isOutOfStock ? "Out of Stock" : "View Product"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
