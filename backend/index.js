import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";

// Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import contactRoutes from "./routes/contact.js";
import adminContactRoutes from "./routes/adminContact.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import categoryRoutes from "./routes/category.js";


// Models
import Order from "./models/order.model.js";





dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- Middlewares -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


/* -------------------- Session -------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/organicbazar",
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* -------------------- Static Files -------------------- */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


/* -------------------- Routes -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user/contact", contactRoutes);
app.use("/api/admin/contact", adminContactRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/category",categoryRoutes);




/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("✅ Organic Bazar API is running...");
});


/* -------------------- Database & Server -------------------- */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/organicbazar")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

