import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminSellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await axios.get(
          `${backendURL}/api/admin/contact/seller-requests`,
          { withCredentials: true }
        );
        if (data.success) setRequests(data.requests);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch seller requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (userId, action) => {
    setProcessing(prev => ({ ...prev, [userId]: true }));

    try {
      // Make sure /contact is included
      const url = `${backendURL}/api/admin/contact/${action}/${userId}`;
      const { data } = await axios.patch(url, {}, { withCredentials: true });

      if (data.success) {
        toast.success(data.message);
        setRequests(prev => prev.filter(req => req._id !== userId));
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (requests.length === 0) return <p className="text-center mt-10">No pending seller requests</p>;

  return (
    <div className="bg-white shadow rounded p-5 max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">Pending Seller Requests</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Farm Name</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(user => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.sellerRequest?.farmName || "-"}</td>
              <td className="border px-4 py-2">{user.sellerRequest?.address || "-"}</td>
              <td className="border px-4 py-2 flex gap-2">
                <button
                  onClick={() => handleAction(user._id, "seller-approve")}
                  disabled={processing[user._id]}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  {processing[user._id] ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => handleAction(user._id, "seller-reject")}
                  disabled={processing[user._id]}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  {processing[user._id] ? "Processing..." : "Reject"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSellerRequests;
