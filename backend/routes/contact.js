
import express from "express";
import Contact from "../models/Contact.js";
import { authUserOrSeller } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ------------------------------
// POST /api/contact
// Save a new contact message (authenticated users)
// ------------------------------
router.post("/", authUserOrSeller, async (req, res) => {
  try {
    const { name, message, type } = req.body;

    if (!name || !message) {
      return res.status(400).json({ success: false, message: "Name and message are required" });
    }

    // Get user email from session (auth middleware)
    const email = req.user.email;

    const newMessage = await Contact.create({
      name,
      email,
      message,
      type: type || "feedback",
      status: "pending", // default status
    });

    res.json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------------
// GET /api/contact/messages
// Fetch all messages for the logged-in user
// ------------------------------
router.get("/messages", authUserOrSeller, async (req, res) => {
  try {
const email = req.user.email;


    const messages = await Contact.find({ email })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: messages });

  } catch (err) {
    console.error("Error fetching user messages:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
