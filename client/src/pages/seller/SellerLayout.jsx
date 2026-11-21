import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const SellerLayout = () => {

  const navigate = useNavigate();
  const { user, loading, logout } = useAppContext();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!user || user.role !== "seller") {
    navigate("/login");
    return null;
  }

  const baseUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const profileUrl =
    user?.profile
      ? user.profile.startsWith("http")
        ? user.profile
        : `${baseUrl}/uploads/${user.profile}`
      : assets.profile_icon;

  const sidebarLinks = [

    {
      name: "Dashboard",
      path: "",
      icon: assets.dashboardicon || assets.add_icon,
    },

    {
      name: "Add Product",
      path: "add-product",
      icon: assets.add_icon,
    },

    {
      name: "Product List",
      path: "product-list",
      icon: assets.product_list_icon,
    },

    {
      name: "Orders",
      path: "orders",
      icon: assets.order_icon,
    },

    {
      name:"Feedback",
      path:"contact",
      icon:assets.feedback_icon,
    },
    // ✅ Profile added in sidebar
    {
      name: "My Profile",
      path: "profile",
      icon: assets.profile_icon,
    },

  ];

  return (
  <>
    {/* ================= HEADER ================= */}

    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3
      bg-[#fafafa] border-b border-gray-200"
    >
      <Link to="/">
        <h1 className="text-2xl font-semibold text-gray-800">
          Organic Bazar Seller 🌱
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        <p className="hidden sm:block font-medium">
          Hi, {user?.name}
        </p>

        <img
          src={profileUrl}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border"
        />
      </div>
    </header>

    {/* ================= SIDEBAR ================= */}

    <aside
      className="
      fixed top-[60px] left-0
      md:w-64 w-16
      h-[calc(100vh-60px)]
      bg-white border-r border-gray-200
      flex flex-col justify-between
      "
    >
      {/* Top Links */}
      <div>
        {sidebarLinks.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === ""}
            className={({ isActive }) =>
              `flex items-center py-3 px-4 gap-3 transition-all duration-200
              ${
                isActive
                  ? "bg-gray-800 text-white md:border-r-[6px] border-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <img src={item.icon} className="w-6 h-6" />

            <p className="md:block hidden font-medium">
              {item.name}
            </p>
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="mb-4">
        <button
          onClick={() => logout()}
          className="flex items-center w-full py-3 px-4 gap-3 text-red-600 hover:bg-red-50 transition"
        >
          <FaSignOutAlt size={18} />

          <span className="md:block hidden font-medium">
            Logout
          </span>
        </button>
      </div>
    </aside>

    {/* ================= MAIN CONTENT ================= */}

    <main
      className="
      md:ml-64 ml-16
      mt-[60px]
      p-4 md:p-6
      bg-[#fafafa]
      min-h-screen
      "
    >
      <Outlet />
    </main>
  </>
);
}

//   return (
//     <>
//       {/* ================= HEADER ================= */}

//       <header className="flex items-center justify-between px-4 md:px-8 py-3
//       bg-[#fafafa] border-b border-gray-200">

//         <Link to="/">
//           <h1 className="text-2xl font-semibold text-gray-800">
//             Organic Bazar Seller 🌱
//           </h1>
//         </Link>

//         <div className="flex items-center gap-3">

//           <p className="hidden sm:block font-medium">
//             Hi, {user?.name}
//           </p>

//           <img
//             src={profileUrl}
//             alt="Profile"
//             className="w-10 h-10 rounded-full object-cover border"
//           />

//         </div>

//       </header>

//       {/* ================= LAYOUT ================= */}

//       <div className="flex min-h-screen bg-[#f9f9f9]">

//         {/* ================= SIDEBAR ================= */}

//         <aside className="md:w-64 w-16 bg-white border-r border-gray-200 pt-4 flex flex-col justify-between">

//           {/* Top Links */}
//           <div>

//             {sidebarLinks.map((item) => (

//               <NavLink
//                 to={item.path}
//                 key={item.name}
//                 end={item.path === ""}
//                 className={({ isActive }) =>
//                   `flex items-center py-3 px-4 gap-3 transition-all duration-200
//                   ${
//                     isActive
//                       ? "bg-gray-800 text-white md:border-r-[6px] border-gray-900"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`
//                 }
//               >

//                 <img
//                   src={item.icon}
//                   className="w-6 h-6"
//                 />

//                 <p className="md:block hidden font-medium">
//                   {item.name}
//                 </p>

//               </NavLink>

//             ))}

//           </div>

//           {/* Bottom section */}
//           <div className="mb-4">

//             {/* Logout */}
//             <button
//               onClick={() => logout()}
//               className="flex items-center w-full py-3 px-4 gap-3 text-red-600 hover:bg-red-50 transition"
//             >

//               <FaSignOutAlt size={18} />

//               <span className="md:block hidden font-medium">
//                 Logout
//               </span>

//             </button>

//           </div>

//         </aside>

//         {/* ================= MAIN ================= */}

//         <main className="flex-1 p-4 md:p-6 bg-[#fafafa]">
//           <Outlet />
//         </main>

//       </div>

//     </>
//   );
// };

export default SellerLayout;
