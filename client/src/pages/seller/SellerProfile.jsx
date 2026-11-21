import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { FaUser, FaEdit, FaLock } from "react-icons/fa";

const SellerProfile = () => {

  // const { user, axios, updateUser } = useAppContext();
const { user, api, setUser } = useAppContext();

  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [tab, setTab] = useState("overview");

  const [updating, setUpdating] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    farmName: "",
    address: "",
    profile: null,
  });

  const [preview, setPreview] = useState("/default_profile.png");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const { data } = await api.get(
        `${backendURL}/api/auth/profile`,
        { withCredentials: true }
      );

      if (data.success) {
        setUser(data.user); // update context with fresh DB data
      }
    } catch (error) {
      console.error("Profile fetch failed:", error);
    }
  };

  fetchProfile();
}, []);
  /* ================= LOAD USER ================= */

  useEffect(() => {
  if (!user) return;

  // ✅ Set profile form data
  // setProfileData({
    // name: user?.name ?? "",
    // email: user?.email ?? "",
    // phone: user?.phone ?? "",
    // farmName: user?.farmName ?? "",
    // address: user?.address ?? "",
    // profile: null,

    setProfileData({
  name: user?.name ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
  farmName: user?.sellerRequest?.farmName ?? user?.farmName ?? "",
  address: user?.sellerRequest?.address ?? user?.address ?? "",
  profile: null,
});
  // });

  // ✅ Handle profile image preview safely
  if (user?.profile) {
    const imageUrl = user.profile.startsWith("http")
      ? user.profile
      : `${backendURL}/uploads/${user.profile}`;

    setPreview(imageUrl);
  } else {
    setPreview("/default_profile.png");
  }

}, [user]);



  /* ================= UPDATE PROFILE ================= */

  const handleProfileUpdate = async (e) => {
  e.preventDefault();

  if (updating) return;

  try {
    setUpdating(true);

    const formData = new FormData();
    formData.append("name", profileData.name);
    formData.append("phone", profileData.phone);
    formData.append("farmName", profileData.farmName);
    formData.append("address", profileData.address);

    if (profileData.profile) {
      formData.append("profile", profileData.profile);
    }

    const response = await api.put(

      `${backendURL}/api/auth/profile`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: () => true, // IMPORTANT
      }
    );

    const data = response.data;

    if (data.success && data.user) {
      toast.success("Profile updated successfully");

      // ✅ force update context properly
     setUser(data.user);

      // ✅ update preview instantly
      if (data.user.profile) {
        setPreview(
          data.user.profile.startsWith("http")
            ? data.user.profile
            : `${backendURL}/uploads/${data.user.profile}?t=${Date.now()}`
        );
      }

      setTab("overview");
    } else {
      toast.error(data.message || "Update failed");
    }

  } catch (error) {
    console.error(error);
    toast.error("Update failed");
  } finally {
    setUpdating(false);
  }
};




  /* ================= CHANGE PASSWORD ================= */

  // const handleChangePassword = async (e) => {

  //   e.preventDefault();

  //   if (passwords.newPassword !== passwords.confirmPassword) {

  //     toast.error("Passwords do not match");
  //     return;

  //   }
  //   console.log("Sending:", {
  //   currentPassword: passwords.currentPassword,
  //   newPassword: passwords.newPassword
  // });

  //   try {

  //     const { data } = await api.put(
  // "/api/auth/profile/change-password",

  //       `${backendURL}/api/auth/profile/change-password`,
  //       passwords,
  //       { withCredentials: true }
  //     );

  //     if (data.success) {

  //       toast.success("Password changed");

  //       setPasswords({
  //         currentPassword: "",
  //         newPassword: "",
  //         confirmPassword: "",
  //       });

  //       setTab("overview");

  //     }

  //   } catch {

  //     toast.error("Password change failed");

  //   }

  // };
  const handleChangePassword = async (e) => {
  e.preventDefault();

  if (passwords.newPassword !== passwords.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  console.log("Sending:", {
    currentPassword: passwords.currentPassword,
    newPassword: passwords.newPassword,
  });

  try {
    const { data } = await api.put(
      `${backendURL}/api/auth/profile/change-password`,
      {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      },
      {
        withCredentials: true,
      }
    );

    if (data.success) {
      toast.success("Password changed");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTab("overview");
    } else {
      toast.error(data.message || "Password change failed");
    }

  } catch (error) {
    console.error(error);
    toast.error("Password change failed");
  }
};




  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Seller Profile
        </h1>



        {/* TABS */}

        <div className="flex gap-4 mb-6">

          <button
            onClick={() => setTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              tab === "overview"
                ? "bg-green-600 text-white"
                : "bg-white border"
            }`}
          >
            <FaUser />
            Overview
          </button>

          <button
            onClick={() => setTab("edit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              tab === "edit"
                ? "bg-green-600 text-white"
                : "bg-white border"
            }`}
          >
            <FaEdit />
            Edit Profile
          </button>

          <button
            onClick={() => setTab("password")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              tab === "password"
                ? "bg-green-600 text-white"
                : "bg-white border"
            }`}
          >
            <FaLock />
            Change Password
          </button>

        </div>



        {/* CONTENT CARD */}

        <div className="bg-white rounded-xl shadow p-6">

          {/* OVERVIEW */}

          {tab === "overview" && (

            <div className="flex flex-col md:flex-row gap-6 items-center">

              <img
                src={preview}
                className="w-32 h-32 rounded-full border object-cover"
              />

              <div className="space-y-2">

                <h2 className="text-xl font-semibold">
                  {user?.name}
                </h2>

              <p>✉ {user?.email}</p>
                <p>📞 {user?.phone}</p>

             <p>🏪 {user?.farmName}</p>
<p>📍 {user?.address}</p>



              </div>

            </div>

          )}



          {/* EDIT PROFILE */}

          {tab === "edit" && (

            <form
              onSubmit={handleProfileUpdate}
              className="space-y-4 max-w-xl"
            >

              <input
                type="file"
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    profile: e.target.files[0],
                  })
                }
              />

              <input
                type="text"
                placeholder="Name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    name: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phone: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Farm Name"
                value={profileData.farmName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    farmName: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <textarea
                placeholder="Address"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    address: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <button
                disabled={updating}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>

            </form>

          )}



          {/* CHANGE PASSWORD */}

          {tab === "password" && (

            <form
              onSubmit={handleChangePassword}
              className="space-y-4 max-w-xl"
            >

              <input
                type="password"
                placeholder="Current Password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <input
                type="password"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <button className="bg-green-600 text-white px-6 py-2 rounded">
                Change Password
              </button>

            </form>

          )}

        </div>

      </div>

    </div>

  );

};

export default SellerProfile;
