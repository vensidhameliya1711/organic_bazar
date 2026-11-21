import api from "../api/api";
import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Address = () => {
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
    phone: "",
  });

  const { api, user, navigate } = useAppContext();
  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(
        `${backendURL}/api/address/add`,
        { address },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Address saved successfully");
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  useEffect(() => {
    if (!user) navigate("/cart");
  }, [user, navigate]);

  return (
    <div className="mt-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg p-6 md:p-10">
        
        {/* LEFT – FORM */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Shipping Address
          </h2>

          <form
            onSubmit={submitHandler}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Email", name: "email", colSpan: 2 },
              { label: "Street Address", name: "street", colSpan: 2 },
              { label: "City", name: "city" },
              { label: "State", name: "state" },
              { label: "PIN Code", name: "pinCode" },
              { label: "Country", name: "country" },
              { label: "Phone Number", name: "phone", colSpan: 2 },
            ].map(({ label, name, colSpan }) => (
              <div key={name} className={colSpan === 2 ? "sm:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  name={name}
                  value={address[name]}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg outline-none 
                  focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
            ))}

            <div className="sm:col-span-2 mt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 
                text-white py-3 rounded-lg font-medium transition"
              >
                Save & Continue
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT – IMAGE */}
        <div className="hidden md:flex items-center justify-center">
          <img
            src={assets.add_address_iamge}
            alt="Address illustration"
            className="max-w-sm w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Address;
