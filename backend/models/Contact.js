// backend/models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },

  // New fields for better management
  type: { type: String, enum: ["feedback", "question"], default: "feedback" }, // distinguishes feedback vs question
  status: { type: String, enum: ["pending", "reviewed", "answered"], default: "pending" }, // track admin response
  reply: { type: String, trim: true }, // admin reply
  isDeleted: { type: Number, enum: [0, 1], default: 1 },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
