import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

// Helper function to calculate expiry status

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/admin/products",
          { withCredentials: true }
        );

        if (res.data.success) {
          // Map expiry status for each product
          // const mappedProducts = res.data.products.map((p) => {
          //   const { status, daysLeft } = getExpiryStatus(p.ExpiryDate);
          //   const isDeleted = status === "expired" ? 0 : p.isDeleted;
          //   return { ...p, expiryStatus: status, daysLeft ,isDeleted};
          // });

          setProducts(res.data.products);
          setFilteredProducts(res.data.products);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
          setFilteredProducts(res.data);
        } else {
          toast.error("Unexpected API response");
        }
      } catch (err) {
        console.error("Fetch products error:", err);
        toast.error("Server error while fetching products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Search functionality
 useEffect(() => {
  const filtered = products.filter((p) => {
    const searchValue = search.toLowerCase();

    return (
      p.name?.toLowerCase().includes(searchValue) ||

      // ✅ CATEGORY (important fix)
      (typeof p.category === "object"
        ? p.category?.name?.toLowerCase().includes(searchValue)
        : p.category?.toString().toLowerCase().includes(searchValue)) ||

      // ✅ SELLER
      p.seller?.name?.toLowerCase().includes(searchValue)
    );
  });

  setFilteredProducts(filtered);
}, [search, products]);

  // Delete / Restore product
  const toggleProductStatus = async (id, isDeleted) => {
    try {
      const newStatus = isDeleted === 0 ? 1 : 0; // 0 = deleted, 1 = active
      const res = await axios.put(
        `http://localhost:5000/api/auth/admin/products/${id}`,
        { isDeleted: newStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(newStatus === 0 ? "Product deleted" : "Product restored successfully");
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isDeleted: newStatus } : p))
        );
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Products List", 14, 16);
    const tableColumn = [
      "Name",
      "Price",
      "Offer Price",
        "In 1 Qty",
      "Total Stock",
      "Left Stock",
      "Category",
      
      "Seller",
     
      "Status"
    ];
    const tableRows = filteredProducts.map((p) => [
      p.name,
      p.price,
      p.offerPrice,
      p.unit_pack_kg ? `${p.unit_pack_kg}kg` : "N/A",
      p.original_stock_kg ? `${p.original_stock_kg}kg` : "N/A",
      p.stock_kg ? `${p.stock_kg}kg` : "N/A",
      p.category?.name || "N/A",
      
      p.seller?.name || "N/A",
    
        p.isDeleted === 0
        ? "Deleted"
        : p.inStock === false
        ? "Out of Stock"
        : "Available",
    ]);
    autoTable(doc, { startY: 20, head: [tableColumn], body: tableRows });
    doc.save("products.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((p) => ({
        Name: p.name,
        Price: p.price,
        "Offer Price": p.offerPrice,
        "In 1 Qty": p.unit_pack_kg ? `${p.unit_pack_kg}kg` : "N/A",
        "Total Stock": p.original_stock_kg ? `${p.original_stock_kg}kg` : "N/A",
        "Left Stock": p.stock_kg ? `${p.stock_kg}kg` : "N/A",
        Category: p.category?.name || "N/A",
        
        Seller: p.seller?.name || "N/A",
       
            Status:
          p.isDeleted === 0
            ? "Deleted"
            : p.inStock === false
            ? "Out of Stock"
            : "Available",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  if (loading) return <p className="text-center py-10">Loading products...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>

      {/* Search + Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search by name, category, seller..."
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

      {/* Products Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Seller</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Offer Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">In 1 Qty</th>
               <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Stock</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Left Stock</th>
             
              
             

                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (

                
                
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{p.name}</td>
                                <td className="px-4 py-2">
  {typeof p.category === "object"
    ? p.category?.name
    : p.category || "N/A"}
</td>
  <td className="px-4 py-2">{p.seller?.name || "N/A"}</td>
         
                  <td className="px-4 py-2">₹{p.price}</td>
                  <td className="px-4 py-2">₹{p.offerPrice}</td>
                  <td className="px-4 py-2">{p.unit_pack_kg}kg</td>

                    <td className="px-4 py-2">{p.original_stock_kg}</td>
                    <td className="px-4 py-2">{p.
stock_kg}</td>
                
                  <td className="px-4 py-2">
                    {p.isDeleted === 0 ? (
                      <span className="text-red-500 font-semibold">Deleted</span>
                    ) : p.inStock === false ? (
                      <span className="text-yellow-500 font-semibold">Out of Stock</span>
                    ) : (
                      <span className="text-green-500 font-semibold">Available</span>
                    )}
                  </td>
                <td className="px-4 py-2">
  
    <button
      onClick={() => toggleProductStatus(p._id, p.isDeleted)}
      className={`px-3 py-1 rounded text-white ${
        p.isDeleted === 0
          ? "bg-green-500 hover:bg-green-600"
          : "bg-red-500 hover:bg-red-600"
      }`}
    >
      {p.isDeleted === 0 ? "Restore" : "Delete"}
    </button>
  
</td>


                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
