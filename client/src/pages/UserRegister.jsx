import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    profile: null,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const newErrors = {};

    if (name === "profile") {
      setFormData({ ...formData, profile: files[0] });
    }
    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "Only alphabets are allowed";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit mobile number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setFormData({ ...formData, name: value.replace(/[^A-Za-z\s]/g, "") });
    } else if (name === "phone") {
      setFormData({ ...formData, phone: value.replace(/\D/g, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await api.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      if (res.data.success) {
        navigate("/login", {
          state: { successMessage: "Registration successful!" },
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 border border-teal-200 shadow-[0_25px_60px_rgba(13,148,136,0.25)]">
        <h2 className="text-3xl font-extrabold text-teal-700 text-center">
          Create Account
        </h2>
        <p className="text-center text-teal-600/70 mb-6">
          Welcome to Organic Bazar 🌿
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none"
            required
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none"
            required
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

          {/* Phone */}
          <div className="flex">
            <span className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-l-xl">
              +91
            </span>
            <input
              type="text"
              name="phone"
              maxLength="10"
              placeholder="Mobile Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-r-xl border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none"
              required
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

          {/* Address */}
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none"
            required
          />
          {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}

{/* Profile */}
          <input
            type="file"
            name="profile"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-2 rounded-xl border border-teal-200"
          />
          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none pr-14"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-teal-600 cursor-pointer hover:text-teal-800"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none pr-14"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-teal-600 cursor-pointer hover:text-teal-800"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-[0_10px_30px_rgba(13,148,136,0.35)] transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-teal-700 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
