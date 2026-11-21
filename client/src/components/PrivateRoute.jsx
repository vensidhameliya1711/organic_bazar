import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAppContext();

  // Show loading while fetching user
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Role not allowed
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  // Allowed, render nested route
  return <Outlet />;
};

export default PrivateRoute;
