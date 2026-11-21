import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiMenu,
  FiLogOut,
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingCart,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // 🔹 LOGOUT (UNCHANGED)
  const handleLogout = async () => {
    try {
      await axios.post(
        `${backendURL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // 🔹 MENU (UNCHANGED)
  const menuItems = [
    { name: "Dashboard", icon: <FiHome />, path: "/admin/dashboard" },
    { name: "Products", icon: <FiBox />, path: "/admin/products" },
    { name: "Orders", icon: <FiShoppingCart />, path: "/admin/orders" },
    {name: "Category", icon: <FiBox/> ,path: "/admin/category"},
    { name: "Users", icon: <FiUsers />, path: "/admin/users" },
    { name: "Sellers", icon: <FiUsers />, path: "/admin/seller" },
    { name: "Seller Requests", icon: <FiUsers />, path: "/admin/seller-requests" }, 
    { name: "Feedback", icon: <FiUsers />, path: "/admin/contact" },
  ];

  // 🔹 FETCH PROFILE (UNCHANGED)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${backendURL}/api/auth/profile`, {
          withCredentials: true,
        });
        if (data?.user?.name) setAdminName(data.user.name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ================= TOP HEADER ================= */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-800">
          Organic Bazar Admin 🌱
        </h1>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          <FiLogOut />
          Logout
        </button>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== SIDEBAR ===== */}
        <aside
          className={`bg-white border-r transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && (
              <span className="font-semibold text-gray-700">Admin Panel</span>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu size={22} />
            </button>
          </div>

          <ul className="mt-4 space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 transition ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
