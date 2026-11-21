import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: String,
  image: String,
  bgColor: String,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);