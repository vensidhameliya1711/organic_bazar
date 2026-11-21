import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";



const SellerForgotPassword = () => {
  const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetLink, setResetLink] = useState(""); // store the link
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!email.trim()) {
        toast.error("Please enter your email");
        return;
      }
  
      setLoading(true);
      setResetLink(""); // reset previous link
  
      try {
        const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const { data } = await api.post(`${backendURL}/api/auth/forgot-password`, { email });
  
        if (data.success) {
          toast.success(data.message);
          setResetLink(data.resetLink); // show link to user
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        console.error("Forgot password error:", err);
        toast.error("Failed to generate reset link");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <main className="mt-16 flex flex-col items-center px-6">
        <form
          className="w-full max-w-md flex flex-col gap-4 p-8 bg-white rounded-lg shadow-lg"
          onSubmit={handleSubmit}
        >
          <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
  
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />
  
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? "Generating Link..." : "Generate Reset Link"}
          </button>
        </form>
  
        {/* Display reset link if available */}
        {resetLink && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="mb-2 text-gray-700">
              Click the link below to reset your password:
            </p>
            {/* Open in same tab */}
            <a
              href={resetLink}
              className="text-primary underline font-medium break-all"
            >
              {resetLink}
            </a>
            {/* Optional: button to navigate programmatically */}
            <button
              onClick={() => navigate(`/reset-password/${resetLink.split("/").pop()}`)}
              className="mt-3 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
            >
              Open Reset Page
            </button>
          </div>
        )}
      </main>
    );
  };
export default SellerForgotPassword;
