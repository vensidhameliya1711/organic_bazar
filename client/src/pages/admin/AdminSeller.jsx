// pages/admin/Sellers.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

export default function AdminSeller() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch all sellers
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/admin/sellers",
          { withCredentials: true }
        );
        if (res.data.success) setSellers(res.data.sellers);
        else toast.error("Failed to fetch sellers");
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching sellers");
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // Filter sellers by search
  const filteredSellers = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.farmName?.toLowerCase() || "").includes(search.toLowerCase())
  );

  // Toggle delete/restore
  const toggleSellerStatus = async (id, currentStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/admin/sellers/${id}`,
        { isDeleted: currentStatus === 1 ? 0 : 1 }, // flip status
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(`Seller ${currentStatus === 1 ? "deleted" : "restored"} successfully`);
        setSellers((prev) =>
          prev.map((s) =>
            s._id === id ? { ...s, isDeleted: res.data.seller.isDeleted } : s
          )
        );
      } else {
        toast.error("Failed to update seller status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating seller status");
    }
  };

  // Export to Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredSellers.map((s) => ({
        Name: s.name,
        Email: s.email,
        Phone: s.phone,
        Address: s.sellerRequest?.address || "-",
        FarmName: s.sellerRequest?.farmName || "-",
        RequestedAt: s.sellerRequest?.requestedAt ? new Date(s.sellerRequest.requestedAt).toLocaleString() : "-",
        ApprovedAt: s.sellerRequest?.approvedAt ? new Date(s.sellerRequest.approvedAt).toLocaleString() : "-",
        Status: s.isDeleted === 1 ? "Active" : "Deleted",
        "Created At": new Date(s.createdAt).toLocaleString(),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sellers");
    XLSX.writeFile(wb, "sellers.xlsx");
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Email", "Phone", "Address", "Farm Name", "Requested At", "Approved At", "Status", "Created At"]],
      body: filteredSellers.map((s) => [
        s.name,
        s.email,
        s.phone || "-",
        s.sellerRequest?.address || "-",
        s.sellerRequest?.farmName || "-",
        s.sellerRequest?.requestedAt ? new Date(s.sellerRequest.requestedAt).toLocaleString() : "-",
        s.sellerRequest?.approvedAt ? new Date(s.sellerRequest.approvedAt).toLocaleString() : "-",
        s.isDeleted === 1 ? "Active" : "Deleted",
        new Date(s.createdAt).toLocaleString(),
      ]),
    });
    doc.save("sellers.pdf");
  };

  if (loading) return <p className="text-center py-10">Loading sellers...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Sellers</h1>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Search sellers..."
          className="px-4 py-2 border rounded w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Address</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Farm Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Request for seller</th>
               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Approved Request</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSellers.length > 0 ? (
              filteredSellers.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{s.phone || "-"}</td>
                  <td className="px-4 py-2">{s.sellerRequest?.address || "-"}</td>
                  <td className="px-4 py-2">{s.sellerRequest?.farmName || "-"}</td>
                  <td className="px-4 py-2">{s.sellerRequest?.requestedAt ? new Date(s.sellerRequest.requestedAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2">{s.sellerRequest?.approvedAt ? new Date(s.sellerRequest.approvedAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2">{s.isDeleted === 1 ? "Active" : "Deleted"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleSellerStatus(s._id, s.isDeleted)}
                      className={`px-3 py-1 rounded text-white ${
                        s.isDeleted === 1 ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {s.isDeleted === 1 ? "Delete" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No sellers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
