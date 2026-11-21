import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { toast, Toaster } from "react-hot-toast";

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAppContext();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ UI only

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
    }
    generateCaptcha();
  }, [location.state]);

  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(code);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (captchaInput !== captcha) {
      toast.error("CAPTCHA does not match!");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    const userData = await login(formData.email, formData.password);

   const handleSubmit = async (e) => {
  e.preventDefault();

  if (captchaInput !== captcha) {
    toast.error("CAPTCHA does not match!");
    generateCaptcha();
    setCaptchaInput("");
    return;
  }

  try {
    const userData = await login(formData.email, formData.password);

    if (userData) {
      // ❌ Ye deactivate check ab ideally backend me hona chahiye
      if (userData.isDeleted === 0 && userData.role !== "admin") {
        toast.error("Your account is deactivated. Please contact support.");
        return;
      }

      switch (userData.role) {
        case "user":
          navigate("/home");
          break;
        case "seller":
          navigate("/seller");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          toast.error("Unknown role, cannot redirect");
      }
    }

  } catch (err) {
    toast.error(err || "Login failed");
  }

    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden
                    bg-gradient-to-br from-emerald-50 via-teal-100 to-sky-100">

      <Toaster position="top-center" />

      {/* BACKGROUND GLOW */}
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-teal-300/30 blur-3xl
                     animate-[floatUp_12s_linear_infinite]"
          style={{
            width: Math.random() * 70 + 30 + "px",
            height: Math.random() * 70 + 30 + "px",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md rounded-3xl
                      bg-white/80 backdrop-blur-xl
                      border border-teal-200
                      shadow-[0_25px_70px_rgba(0,128,128,0.25)]
                      p-10 transition hover:scale-[1.01]">

        <h2 className="text-center text-4xl font-extrabold
                       bg-gradient-to-r from-emerald-600 to-teal-600
                       bg-clip-text text-transparent">
          Login
        </h2>

        <p className="text-center text-gray-600 mt-2 mb-8">
          Sign in to your <span className="font-semibold text-teal-700">Organic Bazar</span> account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-teal-200 bg-white
                       px-4 py-3 text-gray-700 shadow-sm
                       focus:ring-2 focus:ring-teal-400
                       focus:border-transparent transition"
          />

          {/* PASSWORD WITH SHOW/HIDE */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-teal-200 bg-white
                         px-4 py-3 pr-12 text-gray-700 shadow-sm
                         focus:ring-2 focus:ring-teal-400
                         transition"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         cursor-pointer text-sm font-medium text-teal-600
                         hover:text-teal-800 select-none">
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* CAPTCHA */}
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center px-5 py-2 rounded-xl
                            bg-gradient-to-r from-emerald-100 to-teal-200
                            border border-teal-300
                            font-mono text-xl tracking-widest text-teal-800
                            shadow-inner select-none">
              {captcha}
            </div>

            <button
              type="button"
              onClick={generateCaptcha}
              className="px-4 py-2 rounded-xl
                         bg-gradient-to-r from-emerald-500 to-teal-500
                         text-white shadow-md
                         hover:from-emerald-600 hover:to-teal-600
                         active:scale-95 transition">
              🔄
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter CAPTCHA"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            required
            className="w-full rounded-xl border border-teal-200 bg-white
                       px-4 py-3 shadow-sm
                       focus:ring-2 focus:ring-teal-400 transition"
          />

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-lg font-semibold text-white
                       bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600
                       shadow-lg hover:shadow-teal-500/50
                       hover:-translate-y-0.5
                       active:scale-95 transition-all duration-300">
            Login
          </button>
        </form>

        {/* LINKS */}
        <div className="mt-5 flex justify-between text-sm font-medium text-teal-700">
          <span
            onClick={() => navigate("/register")}
            className="cursor-pointer hover:underline">
            Create New Account
          </span>

          <span
            onClick={() => navigate("/forgot-password")}
            className="cursor-pointer hover:underline">
            Forgot Password?
          </span>
        </div>

        <p
          onClick={() => navigate("/")}
          className="mt-7 text-center text-sm text-teal-700 cursor-pointer hover:underline">
          ← Back to Home
        </p>
      </div>
    </div>
  );
};

export default UserLogin;
