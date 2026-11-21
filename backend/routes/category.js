import express from "express";
import Category from "../models/Category.js";
import { authAdmin } from "../middlewares/auth.middleware.js";
import upload from "../config/multer.js";
const router = express.Router();

// ➕ ADD CATEGORY
router.post("/", authAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, bgColor } = req.body;
    const file = req.file;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name required"
      });
    }

    // ✅ Better slug
    const slug = name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    // ✅ Check by slug
    const exist = await Category.findOne({ slug });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name,
      slug,
      bgColor,
      image: file ? file.filename : "",
      isDeleted: false
    });

    res.json({ success: true, data: category });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 📥 GET ACTIVE
router.get("/", async (req, res) => {
  const data = await Category.find({ isDeleted: false });
  res.json({ success: true, data });
});

// 🗑️ GET TRASH
router.get("/trash", authAdmin, async (req, res) => {
  const data = await Category.find({ isDeleted: true });
  res.json({ success: true, data });
});

// ✏️ UPDATE
// ✏️ UPDATE CATEGORY with optional image upload
router.put("/:id", authAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, bgColor } = req.body;
    const file = req.file;

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const updateData = { name, slug, bgColor };
    if (file) updateData.image = file.filename; // only update image if uploaded

    const updated = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ❌ DELETE (SOFT)
router.put("/delete/:id", authAdmin, async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  res.json({ success: true });
});

// ♻️ RESTORE
router.put("/restore/:id", authAdmin, async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, {
    isDeleted: false
  });

  res.json({ success: true });
});

export default router;