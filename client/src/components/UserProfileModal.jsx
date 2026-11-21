import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaUser, FaEdit, FaLock, FaStore } from "react-icons/fa";

const UserProfile = () => {
  const { user, api, setUser } = useAppContext();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [tab, setTab] = useState("overview");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profile: null,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preview, setPreview] = useState("/default_profile.png");

  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    accountStatus: "Inactive",
  });

  const [sellerRequest, setSellerRequest] = useState(null);
const [sellerStatus, setSellerStatus] = useState(null);



  const fetchSellerStatus = async () => {
  try {

    const res = await api.get("/api/auth/my-request", {
      withCredentials: true,
    });

    if (res.data.success) {

      // console.log("Seller Request:", res.data.sellerRequest);

      setSellerStatus(res.data.sellerRequest?.status);
      setSellerRequest(res.data.sellerRequest); // ⭐ IMPORTANT

    }

  } catch (error) {

    console.error(
      "Error fetching seller status:",
      error.response?.data || error.message
    );

  }
};




  // LOAD USER AND STATS
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  


    // Set profile data
    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      profile: null,
    });

    // Profile image preview
    setPreview(user.profile ? `${backendURL}/uploads/${user.profile}` : "/default_profile.png");

    // Fetch stats
    const fetchStats = async () => {
      let totalOrders = 0;
      let wishlistItems = 0;

      try {
        const ordersRes = await api.get(`${backendURL}/api/orders/user`, { withCredentials: true });
        totalOrders = ordersRes.data.orders?.length || 0;
      } catch (err) {
        console.error("Error fetching orders:", err);
      }

      try {
        const wishlistRes = await api.get(`${backendURL}/api/wishlist/`, { withCredentials: true });
        wishlistItems = wishlistRes.data.wishlist?.length || 0;
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }

      const accountStatus = user?.isDeleted === 1 ? "Inactive" : "Active";

      setStats({
        totalOrders,
        wishlistItems,
        accountStatus,
      });
    };

    fetchStats();

    // ✅ Set sellerStatus properly
    if (user?.sellerRequest) {
      setSellerStatus(user.sellerRequest.status);
    } else {
      setSellerStatus(null);
    }
     console.log("user.sellerRequest:", user.sellerRequest);

  if (user?.sellerRequest) {
    console.log("Seller status from user:", user.sellerRequest.status);
    setSellerStatus(user.sellerRequest.status?.toLowerCase());
  } else {
    setSellerStatus(null);
  }

  if (tab === "seller") {
    fetchSellerStatus();
  }


  }, [user, navigate, api, backendURL,tab]);

  /* UPDATE PROFILE */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (profileData[key]) formData.append(key, profileData[key]);
      });

      const { data } = await api.put(`${backendURL}/api/auth/profile`, formData, { withCredentials: true });

      if (data.success) {
        toast.success("Profile updated");
        setUser(data.user);
        setTab("overview");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* CHANGE PASSWORD */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { data } = await api.put(`${backendURL}/api/auth/profile/change-password`, passwords, { withCredentials: true });

      if (data.success) {
        toast.success("Password changed");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTab("overview");
      }
    } catch {
      toast.error("Password change failed");
    }
  };

  const handleReapply = () => {
    setSellerStatus(null); // reset previous request
    navigate("/seller-verification");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="bg-white rounded-xl shadow p-4 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: <FaUser /> },
            { id: "edit", label: "Edit Profile", icon: <FaEdit /> },
            { id: "password", label: "Change Password", icon: <FaLock /> },
            { id: "seller", label: "Seller Verification", icon: <FaStore /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                tab === item.id ? "bg-teal-600 text-white" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="md:col-span-3 bg-white rounded-xl shadow p-8">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-8">
              {/* PROFILE CARD */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <img src={preview} className="w-32 h-32 rounded-full border object-cover shadow" />
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-xl font-semibold text-gray-800">{profileData.name}</h2>
                  <p className="text-sm text-gray-600">{profileData.email}</p>
                  <p className="text-sm text-gray-600">{profileData.phone}</p>
                  <p className="text-sm text-gray-600">{profileData.address}</p>
                  <button onClick={() => setTab("edit")} className="mt-3 inline-block text-sm text-teal-600 font-medium hover:underline">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 text-center shadow hover:shadow-md transition">
                  <p className="text-3xl font-bold text-teal-700">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center shadow hover:shadow-md transition">
                  <p className="text-3xl font-bold text-emerald-700">{stats.wishlistItems}</p>
                  <p className="text-sm text-gray-600 mt-1">Wishlist Items</p>
                </div>
                <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5 text-center shadow hover:shadow-md transition">
                  <p className="text-3xl font-bold text-cyan-700">{stats.accountStatus}</p>
                  <p className="text-sm text-gray-600 mt-1">Account Status</p>
                </div>
              </div>
              {/* QUICK ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/my-orders")}
                  className="flex-1 border rounded-lg py-3 text-sm font-medium hover:bg-gray-50 transition"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate("/wishlist")}
                  className="flex-1 border rounded-lg py-3 text-sm font-medium hover:bg-gray-50 transition"
                >
                  View Wishlist
                </button>
              </div>
    
            </div>
          )}

  

          {/* EDIT PROFILE */}
          {tab === "edit" && (
            <form onSubmit={handleProfileUpdate} className="max-w-2xl space-y-5">
              {/* Profile Photo */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Profile Photo</label>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-teal-50 file:text-teal-700
                    hover:file:bg-teal-100"
                  onChange={(e) => setProfileData({ ...profileData, profile: e.target.files[0] })}
                />
              </div>

              {/* Name, Email, Phone */}
              {["name", "email", "phone"].map((field) => (
                <div className="flex flex-col gap-2" key={field}>
                  <label className="text-sm font-medium text-gray-700">
                    {field === "name" ? "Full Name" : field === "email" ? "Email Address" : "Phone Number"}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={profileData[field]}
                    onChange={(e) => setProfileData({ ...profileData, [field]: e.target.value })}
                    className="w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder={`Enter your ${field}`}
                  />
                </div>
              ))}

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea
                  rows={3}
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Enter your address"
                />
              </div>

              <div className="pt-3">
                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition text-sm font-medium">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* CHANGE PASSWORD */}
          {tab === "password" && (
            <form onSubmit={handleChangePassword} className="max-w-xl space-y-5">
              {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                <div className="flex flex-col gap-2" key={field}>
                  <label className="text-sm font-medium text-gray-700">
                    {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    placeholder={`Enter ${field === "confirmPassword" ? "re-enter" : "your"} password`}
                    className="w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="pt-3">
                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition text-sm font-medium">
                  Change Password
                </button>
              </div>
            </form>
          )}

{/* SELLER */}
{tab === "seller" && (
  <div>

    <h2 className="text-xl font-bold mb-4">
      Become a Seller 🏪
    </h2>

    <p className="text-gray-600 mb-4">
      Verify your business to start selling on Organic Bazar.
    </p>

    {/* PENDING */}
    {sellerStatus === "pending" && sellerRequest && (
      <div className="space-y-2 bg-blue-50 p-4 rounded-lg">

        <p className="text-blue-600 font-semibold">
          ⏳ Your seller request is under review.
        </p>

        <p>
          <strong>Farm Name:</strong>
          {" "}
          {sellerRequest.farmName}
        </p>

        <p>
          <strong>Address:</strong>
          {" "}
          {sellerRequest.address}
        </p>

        <p className="text-sm text-gray-500">
          Requested on:
          {" "}
          {new Date(
            sellerRequest.requestedAt
          ).toLocaleString()}
        </p>

      </div>
    )}

    {/* REJECTED */}
    {sellerStatus === "rejected" && sellerRequest && (
      <div className="space-y-2 bg-red-50 p-4 rounded-lg">

        <p className="text-red-600 font-semibold">
          ❌ Your seller request was rejected.
        </p>

        <button
          onClick={handleReapply}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Reapply
        </button>

      </div>
    )}

    {/* NONE */}
    {(!sellerStatus || sellerStatus === "none") && (
      <Link to="/seller-verification">
        <button className="bg-green-600 text-white px-5 py-2 rounded-lg">
          Apply for Seller Verification
        </button>
      </Link>
    )}

  </div>
)}


        </div>
      </div>
    </div>
  );
};

export default UserProfile;
