import Address from "../models/address.model.js";

// Add a new address
export const addAddress = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const addressData = req.body.address || req.body;

    const savedAddress = await Address.create({
      ...addressData,
      userId,
      isDeleted: 1, // active
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: savedAddress,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Get all addresses of logged-in user (only active)
export const getAddress = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const addresses = await Address.find({ userId, isDeleted: 1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Get Address Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Soft delete an address (set isDeleted = 0)
export const softDeleteAddress = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const { addressId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const address = await Address.findOne({ _id: addressId, userId, isDeleted: 1 });
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });

    address.isDeleted = 0;
    await address.save();

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Soft Delete Address Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};
