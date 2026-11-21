import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import moment from "moment";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/admin/users",
          { withCredentials: true }
        );
        if (res.data.success) {
          setUsers(res.data.users);
          setFilteredUsers(res.data.users);
        } else {
          toast.error("Failed to fetch users");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = users.filter(u => {
      const name = u.name.toLowerCase();
      const email = u.email.toLowerCase();
      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    });
    setFilteredUsers(filtered);
  }, [search, users]);

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Users List", 14, 16);
    const tableColumn = ["Name", "Email", "Phone No", "Address", "Created At", "Status"];
    const tableRows = filteredUsers.map(u => [
      u.name,
      u.email,
      u.phone || "N/A",
      u.address || "N/A",
      moment(u.createdAt).format("YYYY-MM-DD HH:mm"),
      u.isDeleted === 1 ? "Active" : "Deleted",
    ]);
    autoTable(doc, { startY: 20, head: [tableColumn], body: tableRows });
    doc.save("users.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredUsers.map(u => ({
        Name: u.name,
        Email: u.email,
        "Phone No": u.phone || "N/A",
        Address: u.address || "N/A",
        "Created At": moment(u.createdAt).format("YYYY-MM-DD HH:mm"),
        Status: u.isDeleted === 1 ? "Active" : "Deleted",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  // Toggle Delete / Restore
  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/admin/users/${id}`,
        { isDeleted: currentStatus === 1 ? 0 : 1 }, // 1 → 0 (delete), 0 → 1 (restore)
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(`User ${currentStatus === 1 ? "deleted" : "restored"} successfully`);
        // Update local state
        setUsers(prev =>
          prev.map(u => (u._id === id ? { ...u, isDeleted: res.data.user.isDeleted } : u))
        );
      } else {
        toast.error("Failed to update user status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating user status");
    }
  };

  if (loading) return <p className="text-center py-10">Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Users</h1>

      {/* Search + Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="border rounded px-3 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone No</th>
               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Address</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.phone || "N/A"}</td> 
                  <td className="px-4 py-2">{u.address || "N/A"}</td>
                  <td className="px-4 py-2">{moment(u.createdAt).format("YYYY-MM-DD HH:mm")}</td>
                  <td className="px-4 py-2">{u.isDeleted === 1 ? "Active" : "Deleted"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleUserStatus(u._id, u.isDeleted)}
                      className={`px-3 py-1 rounded text-white ${
                        u.isDeleted === 1 ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {u.isDeleted === 1 ? "Delete" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
