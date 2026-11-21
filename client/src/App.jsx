import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import UserProfile from "./components/UserProfileModal.jsx";
// import MainPage from "./pages/MainPage";
import Register from "./pages/UserRegister";
import Login from "./pages/UserLogin";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductCategory from "./pages/ProductCategory";
import PrivateRoute from "./components/PrivateRoute";
import { useAppContext } from "./context/AppContext";
import SingleProduct from "./pages/SingleProduct";
import Products from "./pages/Products";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Wishlist from "./pages/Wishlist";
import SellerVerification from "./pages/SellerVerification.jsx";

// Seller pages
import SellerLayout from "./pages/seller/SellerLayout";
import SellerDashboard from "./pages/seller/sellerdashboard";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import SellerForgotPassword from "./pages/seller/SellerForgotPassword";
import SellerResetPassword from "./pages/seller/SellerResetPassword";
import SellerProfile from "./pages/seller/SellerProfile.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSeller from "./pages/admin/AdminSeller";
import AdminContact from "./pages/admin/AdminContact.jsx";
import AdminSellerRequests from "./pages/admin/AdminSellerRequests.jsx";
import AdminCategory from "./pages/admin/AdminCategory.jsx";

export default function App() {
  const { user, loading } = useAppContext();
  const location = useLocation();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // Routes where Navbar & Footer should be hidden
  
const hideNavbarFooterRoutes = [
  "/login",
  "/register",
  "/forgot-password"
];

const isAuthPage =
  hideNavbarFooterRoutes.includes(location.pathname) ||
  location.pathname.startsWith("/reset-password");

const isAdminRoute = location.pathname.startsWith("/admin");
const isSellerRoute = location.pathname.startsWith("/seller");

const shouldHideNavbarFooter =
  isAuthPage ||
  isAdminRoute ||
  isSellerRoute;


  return (
  <div className="flex flex-col min-h-screen">
    <Toaster position="top-center" reverseOrder={false} />

    {/* Show Navbar only for user role and not on welcome/auth pages */}
   {!shouldHideNavbarFooter && <Navbar />}


    {/* Page content grows to take available space */}
    <div className="flex-grow">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}

        <Route path="/products" element={<Products />} />
  <Route path="/products/:category" element={<ProductCategory />} />
  <Route path="/product/:category/:id" element={<SingleProduct />} />
  <Route path="/about-us" element={<AboutUs />} />
  <Route path="/contact-us" element={<ContactUs />} />

        {/* User Routes */}
        <Route element={<PrivateRoute allowedRoles={["user"]} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<Address />} />
          {/* <Route path="/products" element={<Products />} /> */}
          {/* <Route path="/products/:category" element={<ProductCategory />} /> */}
          {/* <Route path="/product/:category/:id" element={<SingleProduct />} /> */}
          {/* <Route path="/about-us" element={<AboutUs />} /> */}
          {/* <Route path="/contact-us" element={<ContactUs />} /> */}
          <Route path="/seller-verification" element={<SellerVerification />} />
         

          <Route path="/profile" element={<UserProfile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        {/* Seller Routes */}
        <Route element={<PrivateRoute allowedRoles={["seller"]} />}>
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<SellerProfile />} />
          <Route path="contact" element={<ContactUs />} />

            <Route path="/seller/forgot-password" element={<SellerForgotPassword />} />
            <Route path="/seller/reset-password/:token" element={<SellerResetPassword />} /> 
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="seller" element={<AdminSeller />} />
            <Route path="seller-requests" element={<AdminSellerRequests />} />
            <Route path="/admin/contact" element={<AdminContact />} />
            <Route path="/admin/category" element={<AdminCategory />} />
          </Route>
        </Route>
      </Routes>
    </div>

    {/* Footer */}
    { !shouldHideNavbarFooter && <Footer />}
  
  </div>
);

}
