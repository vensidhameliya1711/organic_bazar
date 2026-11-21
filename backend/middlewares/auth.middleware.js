
// // backend/middleware/auth.middleware.js

// ------------------------------
// Check if user is logged in
// ------------------------------
export const isAuthenticated = (req, res, next) => {
  const user = req.session?.user;

  if (!user || !user.role) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  // Skip isDeleted check for admin (admin may not exist in DB)
  if (user.role !== "admin" && user.isDeleted === 0) {
    return res.status(401).json({ success: false, message: "Account is deactivated" });
  }

  next();
};

// ------------------------------
// Role-based authorization
// ------------------------------
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.session?.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
  };
};

// ------------------------------
// Seller-only routes
// ------------------------------
export const authSeller = (req, res, next) => {
  const user = req.session?.user;

  if (!user || user.role !== "seller") {
    return res.status(403).json({ success: false, message: "Only sellers can access this route" });
  }

  if (user.isDeleted === 0) {
    return res.status(401).json({ success: false, message: "Seller account is deactivated" });
  }

  next();
};

// ------------------------------
// User-only routes
// ------------------------------
// auth.middleware.js
// User-only routes
export const authUser = (req, res, next) => {
  try {
    const user = req.session?.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
    }

    if (user.role !== "user") {
      return res.status(403).json({ success: false, message: "Only users can access this route" });
    }

    // Check if account is active: 1 = active, 0 = deleted
    if (user.isDeleted === 0) {
      return res.status(401).json({ success: false, message: "User account is deactivated" });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ success: false, message: "Server error in auth middleware" });
  }
};

// ------------------------------
// Admin-only routes
// ------------------------------
export const authAdmin = (req, res, next) => {
  const user = req.session?.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Only admin can access this route" });
  }

  // Admin does not have isDeleted in DB, skip that check
  next();
};


export const authUserOrSeller = (req, res, next) => {
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  if (!["user", "seller"].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // ✅ Attach session user to req.user
  req.user = user;

  next();
};



// // ------------------------------
// // Check if user is logged in (any role)
// // ------------------------------
// export const isAuthenticated = (req, res, next) => {
//   const user = req.session?.user;

//   if (!user || !user.role) {
//     return res.status(401).json({
//       success: false,
//       message: "Not authenticated",
//     });
//   }

//   // 0 = deleted, 1 = active
//   if (user.role !== "admin" && user.isDeleted === 0) {
//     return res.status(403).json({
//       success: false,
//       message: "Account is deactivated",
//     });
//   }

//   next();
// };

// // ------------------------------
// // Role-based authorization (generic)
// // ------------------------------
// export const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     const user = req.session?.user;

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Not authenticated",
//       });
//     }

//     if (!roles.includes(user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied",
//       });
//     }

//     next();
//   };
// };

// // ------------------------------
// // Seller-only routes
// // ------------------------------
// export const authSeller = (req, res, next) => {
//   const user = req.session?.user;

//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       message: "Not authenticated",
//     });
//   }

//   if (user.role !== "seller") {
//     return res.status(403).json({
//       success: false,
//       message: "Only sellers can access this route",
//     });
//   }

//   if (user.isDeleted === 0) {
//     return res.status(403).json({
//       success: false,
//       message: "Seller account is deactivated",
//     });
//   }

//   next();
// };

// // ------------------------------
// // User-only routes
// // ------------------------------
// // export const authUser = (req, res, next) => {
// //   const user = req.session?.user;

// //   if (!user) {
// //     return res.status(401).json({
// //       success: false,
// //       message: "Unauthorized: Please log in",
// //     });
// //   }

// //   if (user.role !== "user") {
// //     return res.status(403).json({
// //       success: false,
// //       message: "Only users can access this route",
// //     });
// //   }

// //   if (user.isDeleted === 0) {
// //     return res.status(403).json({
// //       success: false,
// //       message: "User account is deactivated",
// //     });
// //   }

// //   // ❌ DO NOT attach req.user (session-based app)
// //   // req.user = user;  ← REMOVED

// //   next();
// // };

// export const authUser = (req, res, next) => {
//   const user = req.session?.user;

//   if (!user) {
//     return res.status(401).json({ success: false, message: "Unauthorized" });
//   }

//   if (user.role !== "user") {
//     return res.status(403).json({ success: false, message: "Only users allowed" });
//   }

//   next();
// };

// // ------------------------------
// // Admin-only routes
// // ------------------------------
// export const authAdmin = (req, res, next) => {
//   const user = req.session?.user;

//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       message: "Not authenticated",
//     });
//   }

//   if (user.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Only admin can access this route",
//     });
//   }

//   // Admin has no isDeleted flag → skip check
//   next();
// };

