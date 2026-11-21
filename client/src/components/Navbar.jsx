import { useEffect, useRef, useState, memo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { FaChevronRight, FaUser, FaHeart, FaBoxOpen, FaSignOutAlt, FaSearch } from "react-icons/fa";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, searchQuery, setSearchQuery, products, cartCount, logout, loading } = useAppContext();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const navigate = useNavigate();

  /* ================= CLOSE DROPDOWN IF CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= SEARCH AUTOCOMPLETE ================= */
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }

    const filtered = products
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5); // limit 5 suggestions
    setSuggestions(filtered);
  }, [searchQuery, products]);

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchQuery(product.name);
    navigate(`/products?search=${encodeURIComponent(product.name)}`);
    setShowSuggestions(false);
  };

  /* ================= CART CLICK ================= */
  const handleCartClick = () => {
    if (loading) return;
    if (!user?._id) {
      toast.error("Please login to view cart");
      navigate("/login");
      return;
    }
    navigate("/cart");
  };

  if (loading) return null;

  /* ================= NAVLINK ACTIVE CLASS ================= */
  const linkClass = ({ isActive }) =>
    `hover:text-indigo-500 ${isActive ? "text-green-600 font-semibold" : "text-gray-700"}`;

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white sticky top-0 z-50">
      {/* LOGO */}
      <Link to="/">
        <h2 className="text-2xl font-extrabold cursor-pointer flex items-center gap-2
          bg-gradient-to-r from-green-400 via-blue-400 to-blue-600
          bg-clip-text text-transparent
          animate-text-shimmer"
        >
          🌿 Organic Bazar
        </h2>
      </Link>

      {/* NAV LINKS + SEARCH + CART + USER */}
      <div className="hidden sm:flex items-center gap-8 ">
        {/* Links */}
        <div className="flex items-center gap-6">
          <NavLink to="/home" className={linkClass}>Home</NavLink>
          <NavLink to="/products" className={linkClass}>All Products</NavLink>
          <NavLink to="/about-us" className={linkClass}>About Us</NavLink>
          <NavLink to="/contact-us" className={linkClass}>Contact Us</NavLink>
        </div>

        {/* SEARCH BAR */}
        <div className="relative flex-1 max-w-md ml-8">
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-1.5 shadow-sm hover:shadow-md transition">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products"
              className="w-full outline-none placeholder-gray-400 bg-transparent"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleSearchKey}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-12 left-0 w-full bg-white shadow-lg border border-gray-200 rounded-xl z-50 overflow-hidden">
              {suggestions.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleSuggestionClick(product)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                >
                  {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CART */}
        <div onClick={handleCartClick} className="relative cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path
              d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0"
              stroke="#615fff"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
            {cartCount()}
          </span>
        </div>

        {/* USER DROPDOWN */}
        {user?._id ? (
          <div ref={dropdownRef} className="relative ml-4">
            <img
              src={
                user?.profile
                  ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.profile}`
                  : assets.profile_icon
              }
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer object-cover"
              onClick={() => setProfileOpen(!profileOpen)}
            />

            {profileOpen && (
              <ul className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-40 text-sm overflow-hidden">
                <li
                  onClick={() => {
                    navigate("/profile");
                    setProfileOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <FaUser className="text-teal-600" size={14} />
                    My Profile
                  </div>
                  <FaChevronRight className="text-gray-400" size={12} />
                </li>

                <li
                  onClick={() => {
                    navigate("/wishlist");
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800"
                >
                  <FaHeart className="text-pink-500" size={14} />
                  My Wishlist
                </li>

                <li
                  onClick={() => {
                    navigate("/my-orders");
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800"
                >
                  <FaBoxOpen className="text-indigo-500" size={14} />
                  My Orders
                </li>

                <hr className="my-1 border-gray-200" />

                <li
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer text-red-600 font-medium"
                >
                  <FaSignOutAlt size={14} />
                  Logout
                </li>
              </ul>
            )}
          </div>
        ) : (
          <Link to="/login" className="ml-4">
            <button className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default memo(Navbar);
