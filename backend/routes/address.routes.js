import express from "express";
import { addAddress, getAddress, softDeleteAddress } from "../controllers/address.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Add new address
router.post("/add", isAuthenticated, addAddress);

// Get all addresses for logged-in user
router.get("/get", isAuthenticated, getAddress);

// Soft delete an address
router.delete("/delete/:addressId", isAuthenticated, softDeleteAddress);

export default router;
