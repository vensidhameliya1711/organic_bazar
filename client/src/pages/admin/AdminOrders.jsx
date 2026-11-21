import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/admin/orders", {
          withCredentials: true,
        });
        if (res.data.success) {
          const mappedOrders = res.data.orders.map((o) => {
            const subtotal = o.items.reduce(
              (sum, i) => sum + (!i.isCancelled ? (i.price || 0) * i.quantity : 0),
              0
            );
            const totalAmount = +(subtotal * 1.02).toFixed(2); // 2% tax
            return { ...o, totalAmount };
          });
          setOrders(mappedOrders);
          setFilteredOrders(mappedOrders);
        } else {
          toast.error("Failed to fetch orders");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = orders.filter((o) => {
      const userName = o.userId?.name?.toLowerCase() || "";
      const productNames = o.items.map((i) => i.product.name.toLowerCase()).join(" ");
      return (
        userName.includes(search.toLowerCase()) || productNames.includes(search.toLowerCase())
      );
    });
    setFilteredOrders(filtered);
  }, [search, orders]);
// 🔥 Calculate Total Admin Commission
const totalAdminCommission = filteredOrders.reduce((total, order) => {

  // ✅ Sirf successful payment wale orders calculate honge
  if (order.paymentStatus !== "Success") {
    return total;
  }

  const orderCommission = order.items.reduce((sum, item) => {
    if (!item.isCancelled) {
      return sum + (item.adminCommission || 0);
    }
    return sum;
  }, 0);

  return total + orderCommission;

}, 0);
  // Format amount as ₹
  // const formatAmount = (amt) =>
  //   `₹${amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Export PDF
  // Export PDF
const exportPDF = () => {
  const doc = new jsPDF();
  doc.text("Orders List", 14, 16);

  const tableColumn = [
    "User",
    "Product(s)",
     "Date",
    "Quantity",
   "Price",
   "Subtotal",
    "Tax",
     
    "Final Total",
    
    "Seller Amount",
    "Admin Commission",
    
    "Payment Type",
    "Payment Status",
    "Status",
    "Seller Paid",
  ];

  const tableRows = filteredOrders.map((o) => [
    o.userId?.name || "N/A",
    o.items.map((i) => i.product.name).join(", "),
     new Date(o.createdAt).toLocaleDateString(),
    o.items.map((i) => i.quantity).join(", "),
   o.items.map((i) => i.price).join(", "),
    o.items.map((i) => i.subtotal).join(", "),
    o.items.map((i) => i.tax).join(", "),
    o.items.map((i) => i.finalTotal).join(", "),
    
    o.items.map((i) => i.sellerAmount).join(", "),
    o.items.map((i) => i.adminCommission).join(", "),
    
    o.paymentType,
    o.paymentStatus,
    o.status,
    o.payout?.isPaidToSeller ? "Paid" : "Pending",
  ]);

  autoTable(doc, {
    startY: 20,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8 },
  });

  doc.save("orders.pdf");
};

// Export Excel
const exportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    filteredOrders.map((o) => ({
      User: o.userId?.name || "N/A",
      "Product(s)": o.items.map((i) => i.product.name).join(", "),
       Date: new Date(o.createdAt).toLocaleDateString(),
      Quantity: o.items.map((i) => i.quantity).join(", "),
      Price: o.items.map((i) => i.price).join(", "),
      Subtotal: o.items.map((i) => i.subtotal).join(", "),
      Tax: o.items.map((i) => i.tax).join(", "),
      "Final Total": o.items.map((i) => i.finalTotal).join(", "),
     
      "Seller Amount": o.items.map((i) => i.sellerAmount).join(", "),
      "Admin Commission": o.items.map((i) => i.adminCommission).join(", "),
      
      "Payment Type": o.paymentType,
      "Payment Status": o.paymentStatus,
      Status: o.status,
      "Seller Paid": o.payout?.isPaidToSeller ? "Paid" : "Pending",
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  XLSX.writeFile(workbook, "orders.xlsx");
};

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed":
        return "bg-yellow-100 text-yellow-600";
      case "Approved by Seller":
        return "bg-blue-100 text-blue-600";
      case "Delivered":
        return "bg-green-100 text-green-600";
      case "Cancelled by User":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Handle seller payment
  const handlePaySeller = async (orderId, itemId) => {
  try {
    const res = await axios.post(
      `http://localhost:5000/api/orders/admin/pay-seller/${orderId}/${itemId}`,
      {},
      { withCredentials: true }
    );

    if (res.data.success) {
      toast.success("Seller paid successfully");

      // 🔥 Update state item-wise
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item._id === itemId
                    ? {
                        ...item,
                        payout: {
                          isPaidToSeller: true,
                          paidAt: new Date(),
                        },
                      }
                    : item
                ),
              }
            : order
        )
      );
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Payment failed");
  }
};


  if (loading) return <p className="text-center py-10">Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>

      {/* Search + Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search by user or product..."
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
{/* Admin Summary */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  
  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
    <h3 className="text-sm text-gray-600">Total Orders</h3>
    <p className="text-2xl font-bold text-blue-700">
      {filteredOrders.length}
    </p>
  </div>

  <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-sm">
    <h3 className="text-sm text-gray-600">Total Revenue</h3>
    <p className="text-2xl font-bold text-green-700">
      ₹
      {filteredOrders
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
        .toFixed(2)}
    </p>
  </div>

  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg shadow-sm">
    <h3 className="text-sm text-gray-600">Admin Total Commission</h3>
    <p className="text-2xl font-bold text-purple-700">
      ₹{totalAdminCommission.toFixed(2)}
    </p>
  </div>

</div>
      {/* Orders Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product(s)</th>
                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subtotal</th>
                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tax</th>
               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">finalTotal</th>
     
             
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
adminCommission</th>
                 <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"> sellerAmount</th>
                 

           
             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
paymentType</th>
 <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
paymentStatus</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Seller Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
             filteredOrders.flatMap((o) =>
  o.items.map((item) => (
    <tr key={item._id} className="hover:bg-gray-50">
      <td className="px-4 py-2">{o.userId?.name}</td>
      <td className="px-4 py-2">{item.product?.name}</td>
      <td className="px-4 py-2">
        {new Date(o.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2">{item.quantity}</td>
         <td className="px-4 py-2">{item.price}</td>
      <td className="px-4 py-2">{item.subtotal}</td>  
      <td className="px-4 py-2">{item.tax}</td>
      <td className="px-4 py-2">{item.finalTotal}</td>
      
   
        <td className="px-4 py-2">{item.adminCommission}</td>
      <td className="px-4 py-2">{item.sellerAmount}</td>
    
      <td className="px-4 py-2">{o.paymentType}</td>
      <td className="px-4 py-2">{o.paymentStatus}</td>

      <td className="px-4 py-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            item.status
          )}`}
        >
          {item.status}
        </span>
      </td>

      <td className="px-4 py-2">
        <button
          disabled={
            o.paymentStatus !== "Success" ||
            item.payout?.isPaidToSeller=== true
          }
          onClick={() => handlePaySeller(o._id, item._id)}
          className={`px-3 py-1 rounded text-white ${
            o.paymentStatus === "Success" &&
            !item.payout?.isPaidToSeller
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {item.payout?.isPaidToSeller ? "Paid" : "Pay Seller"}
        </button>
      </td>
    </tr>
  ))
)

            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
