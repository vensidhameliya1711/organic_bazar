import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true, trim: true, match: [/^[A-Za-z\s]+$/, "First name can only contain letters and spaces"] },
    lastName: { type: String, required: true, trim: true, match: [/^[A-Za-z\s]+$/, "Last name can only contain letters and spaces"] },
    email: { type: String, required: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"] },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, match: [/^[0-9]{6}$/, "PIN Code must be exactly 6 digits"] },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"] },

    // ✅ Soft delete fields
    isDeleted: { type: Number, enum: [0, 1], default: 1 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🔹 Soft delete method
addressSchema.methods.softDelete = function () {
  this.isDeleted = 0;
  this.deletedAt = new Date();
  return this.save();
};

// ✅ Avoid OverwriteModelError
const Address = mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;
