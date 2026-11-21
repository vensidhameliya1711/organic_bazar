import express from "express";
import Contact from "../models/Contact.js";
import { authAdmin } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";


const router = express.Router();

// ---------------- GET all messages (active + deleted) ----------------
router.get("/", authAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }); // fetch all
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- SOFT DELETE a message ----------------
router.put("/:id/delete", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Contact.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    message.isDeleted = 0; // mark as deleted
    await message.save();

    res.json({ success: true, message: "Message deleted successfully", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- RESTORE a message ----------------
router.put("/:id/restore", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Contact.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    message.isDeleted = 1; // mark as active
    await message.save();

    res.json({ success: true, message: "Message restored successfully", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- REPLY to a message ----------------
router.put("/:id/reply", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const message = await Contact.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    message.reply = reply;
    message.status = "answered";
    await message.save();

    res.json({ success: true, message: "Reply sent successfully", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/seller-requests", authAdmin, async (req, res) => {
  try {
    const requests = await User.find({ "sellerRequest.status": "pending" });

    res.json({ success: true, requests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// APPROVE seller
router.patch("/seller-approve/:userId", authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.role = "seller";
    user.sellerRequest.status = "approved";
    user.sellerRequest.approvedAt = new Date();
    await user.save();

    res.json({ success: true, message: "Seller approved successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// REJECT seller request
router.patch("/seller-reject/:userId", authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.sellerRequest.status = "rejected"; // role stays as "user"
    await user.save();

    res.json({ success: true, message: "Seller request rejected" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
