import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";



const SellerVerification = () => {
  const navigate = useNavigate();

  const [farmName, setFarmName] = useState("");
  const [address, setAddress] = useState("");

  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const submitRequest = async () => {
    if (!farmName || !address) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendURL}/api/auth/become-seller`,
        { farmName, address },
        { withCredentials: true }
      );

      toast.success(data.message);

      // Clear fields after submit
      setFarmName("");
      setAddress("");
       navigate("/profile");

    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Seller Verification
        </h2>

        <label className="block mb-2 font-medium text-gray-700">Farm Name</label>
        <input
          type="text"
          placeholder="Enter your farm name"
          value={farmName}
          onChange={(e) => setFarmName(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
        />

        <label className="block mb-2 font-medium text-gray-700">Address</label>
        <input
          type="text"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
        />

        <button
          onClick={submitRequest}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300"
        >
          Submit Request
        </button>

      </div>

    </div>
  );
};

export default SellerVerification;
