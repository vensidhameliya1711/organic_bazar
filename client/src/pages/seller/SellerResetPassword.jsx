import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";


const SellerResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams(); // get token from URL
  
    const validatePassword = (password) => {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
      return regex.test(password);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!token) return toast.error("Invalid reset token");
      if (!newPassword.trim()) return toast.error("Please enter a new password");
  
      if (!validatePassword(newPassword)) {
        return toast.error(
          "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character and minimum 6 characters"
        );
      }
  
      setLoading(true);
      try {
        const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const { data } = await api.post(`${backendURL}/api/auth/reset-password`, {
          token,
          newPassword,
        });
  
        if (data.success) {
          toast.success(data.message);
          navigate("/login"); // redirect to login
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        console.error("Reset password error:", err);
        toast.error("Failed to reset password");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <main className="mt-16 flex justify-center px-6">
        <form
          className="w-full max-w-md flex flex-col gap-4 p-8 bg-white rounded-lg shadow-lg"
          onSubmit={handleSubmit}
        >
          <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
  
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
  
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </main>
    );
  };
export default SellerResetPassword;
