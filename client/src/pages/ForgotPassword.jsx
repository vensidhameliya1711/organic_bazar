import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // success | error
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {

    if (!email) {
      setMsg("Please enter your email");
      setMsgType("error");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMsg(res.data.message);
      setMsgType("success");
      setOtpSent(true);

    } catch (err) {

      setMsg(err.response?.data?.message || "Failed to send OTP");
      setMsgType("error");

    } finally {
      setLoading(false);
    }

  };

  const resetPassword = async () => {

    if (!email || !otp || !newPassword) {
      setMsg("Please fill all fields");
      setMsgType("error");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { email, otp, newPassword }
      );

      setMsg(res.data.message);
      setMsgType("success");

      if (res.data.message === "Password reset successful") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }

    } catch (err) {

      setMsg(err.response?.data?.message || "Reset failed");
      setMsgType("error");

    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-green-600">
            Organic Bazar
          </h3>
        </div>

        {/* MESSAGE ALERT TOP */}
        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium
            ${msgType === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {msg}
          </div>
        )}

        {/* HEADING */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Forgot Password
        </h2>

        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your email to receive OTP
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:border-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* SEND OTP */}
        <button
          onClick={sendOTP}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium mb-4"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        {/* OTP SECTION */}
        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter new password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* LOGIN LINK */}
        <p className="text-center text-sm mt-4">
          Remember password?{" "}
          <a href="/login" className="text-green-600 hover:underline">
            Login
          </a>
        </p>

      </div>

    </div>
  );

};

export default ForgotPassword;
