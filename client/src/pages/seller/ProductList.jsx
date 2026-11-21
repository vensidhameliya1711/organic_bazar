import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import api from "../../api/api";

const ProductList = () => {
  const { products, setProducts } = useAppContext();
  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [editingProduct, setEditingProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    price: "",
    offerPrice: "",
    unit_pack_kg: "",
    stock_kg: "",
    original_stock_kg: "",
   
addedStock: "",
unitType: "kg",
stockType: "kg",
    description: "",
    category: "",
    
    images: null,
  });

//   const categories = [
//   "Vegetables",
//   "Fruits",
//   "Grains & Pulses",
//   "Spices",
//   "Dairy Products",
//   "Oils & Condiments",
//   "Personal Care",
//   "Health & Wellness",
//   "Gardening Products",
//   "Packaged Foods",
// ];
/* ================= SEARCH & FILTER STATES ================= */

const [searchTerm, setSearchTerm] = useState("");
const [stockFilter, setStockFilter] = useState("all");

const [categoryFilter, setCategoryFilter] = useState("all");
const [categories, setCategories] = useState([]);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const { data } = await api.get(
        `${backendURL}/api/products/my-products-all`,
        { withCredentials: true }
      );
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to fetch products");
    }
  };


  const fetchCategories = async () => {
  try {
    const res = await fetch(`${backendURL}/api/category`);
    const data = await res.json();

    if (data.success) {
      setCategories(data.data);
    }
  } catch (err) {
    console.error("Category fetch error:", err);
  }
};
  useEffect(() => { fetchProducts();  fetchCategories(); }, []);

  /* ================= FILTER LOGIC ================= */

const filteredProducts = products.filter((product) => {

  // Search filter
  const matchesSearch =
    product.name.toLowerCase().includes(searchTerm.toLowerCase());

  // Stock filter
  const matchesStock =
    stockFilter === "all" ||
    (stockFilter === "inStock" && product.inStock) ||
    (stockFilter === "outOfStock" && !product.inStock);


  

  // Category filter
  const matchesCategory =
  categoryFilter === "all" ||
  product.category?._id === categoryFilter;

  return matchesSearch && matchesStock && matchesCategory;

});


  /* ================= STOCK TOGGLE ================= */
  const toggleStock = async (productId, inStock) => {
  const backup = [...products];

  // ✅ instant UI update
  setProducts(prev =>
    prev.map(p => (p._id === productId ? { ...p, inStock } : p))
  );

  try {
    const { data } = await api.patch(
      `${backendURL}/api/products/change-stock`,
      { productId, inStock },
      { withCredentials: true }
    );

    if (!data.success) {
      setProducts(backup);
      toast.error(data.message);
    } else {
      // ✅ ADD THIS
      toast.success(
        inStock ? "Product is now In Stock ✅" : "Product is now Out of Stock ❌"
      );
    }

  } catch (err) {
    setProducts(backup);
    toast.error("Stock update failed");
  }
};

  /* ================= DELETE / RESTORE ================= */
  const toggleDeleteRestore = async (productId, action) => {
    const backup = [...products];
    const isDelete = action === "delete";

    try {
      setProducts(prev =>
        prev.map(p => (p._id === productId ? { ...p, isDeleted: isDelete ? 0 : 1 } : p))
      );

      const url = isDelete
        ? `${backendURL}/api/products/delete`
        : `${backendURL}/api/products/restore`;

      const { data } = await api.patch(url, { id: productId }, { withCredentials: true });
      if (!data.success) { setProducts(backup); toast.error(data.message); }
      else toast.success(data.message);
    } catch {
      setProducts(backup);
      toast.error("Action failed");
    }
  };

  /* ================= EDIT ================= */
  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormValues({
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      unit_pack_kg: product.unit_pack_kg,
      stock_kg: product.stock_kg,
      unitType: product.unitType || "kg",
      stockType: product.stockType || "kg",

      description: product.description,
      category: product.category?._id || "",
      
      images: null,
    });
  };


  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === "images" ? files : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const backup = [...products];

    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (key !== "images") formData.append(key, value);
      });

      if (formValues.images?.length) {
        Array.from(formValues.images).forEach(file => formData.append("images", file));
      }

      const { data } = await api.put(
        `${backendURL}/api/products/${editingProduct._id}`,
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        setProducts(prev => prev.map(p => (p._id === editingProduct._id ? data.product : p)));
        toast.success("Product updated successfully");
        setEditingProduct(null);
      } else {
        setProducts(backup);
        toast.error(data.message);
      }
    } catch (error) {
      setProducts(backup);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-green-50 p-8">
     

      <h2 className="text-3xl font-bold text-center mb-6">My Products 🌿</h2>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow">
        {/* ================= SEARCH & FILTER BAR ================= */}

<div className="max-w-6xl mx-auto mb-4 flex flex-wrap gap-3">

  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search products..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border px-4 py-2 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-green-500 outline-none"
  />

  {/* STOCK FILTER */}
  <select
    value={stockFilter}
    onChange={(e) => setStockFilter(e.target.value)}
    className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
  >
    <option value="all">All Stock</option>
    <option value="inStock">In Stock</option>
    <option value="outOfStock">Out of Stock</option>
  </select>

  

  {/* CATEGORY FILTER */}
  <select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
>
  <option value="all">All Categories</option>

  {categories.map((cat) => (
    <option key={cat._id} value={cat._id}>
      {cat.name}
    </option>
  ))}
</select>

</div>

        <table className="w-full text-sm">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Selling Price</th>
              <th>Unit Pack (kg)</th>
              <th>Original Stock (kg)</th>
              <th>Stock (kg)</th>
              <th>Sold (kg)</th>
<th>Packs</th>
<th>Total Value ₹</th>
<th>Actual Value ₹</th>
      <th>Actions</th>
            </tr>
          </thead>

          <tbody>
  {filteredProducts.map(p => {

    // 🔥 👉 यहीं add करो (inside map)
    const soldKg = (p.original_stock_kg || 0) - (p.stock_kg || 0);

    const totalPacks = Math.floor(
      (p.stock_kg || 0) / (p.unit_pack_kg || 1)
    );
    const totalStockValue = (p.original_stock_kg / p.unit_pack_kg) * p.offerPrice;

const soldValue = ((soldKg / p.unit_pack_kg) * p.offerPrice) * 0.9;

    return (
      <tr key={p._id} className="border-t hover:bg-green-50">

        <td className="p-3 flex gap-3 items-center">
          <img
            src={p.images?.[0] ? `${backendURL}/uploads/${p.images[0]}` : "/placeholder.png"}
            className="w-12 h-12 rounded object-cover"
          />
          {p.name}
        </td>

        <td>{p.category?.name}</td>

        <td className="font-semibold text-green-700">₹{p.price}</td>
        <td className="font-semibold text-green-700">₹{p.offerPrice}</td>

        <td className="text-center">{p.unit_pack_kg}</td>
        <td className="text-center">{p.original_stock_kg}</td>
        <td className="text-center">{p.stock_kg}</td>

        {/* 🔥 NEW */}
        <td className="text-center text-red-500">
          {soldKg.toFixed(2)}
        </td>

        <td className="text-center">
          {totalPacks}
        </td>

        <td className="text-center text-blue-600 font-semibold">
  ₹{totalStockValue.toFixed(2)}
</td>

<td className="text-center text-red-500 font-semibold">
  ₹{soldValue.toFixed(2)}
</td>

        <td className="text-center">
          <input
            type="checkbox"
            checked={p.inStock}
            disabled={p.isDeleted === 0}
            onChange={() => toggleStock(p._id, !p.inStock)}
          />
        </td>

        <td className="space-x-2 text-center">
          <button onClick={() => openEditForm(p)} className="bg-blue-500 text-white px-2 py-1 rounded">
            Edit
          </button>

          {p.isDeleted === 1 ? (
            <button
              onClick={() => toggleDeleteRestore(p._id, "delete")}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={() => toggleDeleteRestore(p._id, "restore")}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Restore
            </button>
          )}
        </td>

      </tr>
    );
  })}
</tbody>
          {filteredProducts.length === 0 && (
  <tr>
    <td colSpan="9" className="text-center py-6 text-gray-500">
      No products found
    </td>
  </tr>
)}

        </table>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingProduct && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

    <form
      onSubmit={handleEditSubmit}
      className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-fadeIn"
    >
      {/* Header */}
      <h3 className="text-2xl font-bold text-center text-green-700">
        Edit Product
      </h3>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          value={formValues.name}
          onChange={handleEditChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-3">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Original Price (₹)
          </label>
          <input
            type="number"
            name="price"
            value={formValues.price}
            onChange={handleEditChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Offer Price (₹)
          </label>
          <input
            type="number"
            name="offerPrice"
            value={formValues.offerPrice}
            onChange={handleEditChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

      </div>
  <div className="grid grid-cols-2 gap-3">

  {/* UNIT PACK */}
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Unit Pack
    </label>

    <div className="flex gap-2">
      <input
        type="number"
        name="unit_pack_kg"
        value={formValues.unit_pack_kg}
        onChange={handleEditChange}
        required
        className="w-full border rounded-lg px-3 py-2"
      />

      <select
        name="unitType"
        value={formValues.unitType}
        onChange={handleEditChange}
        className="border rounded-lg px-2"
      >
        <option value="kg">kg</option>
        <option value="g">g</option>
      </select>
    </div>
  </div>

  {/* STOCK */}
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Current Stock: {editingProduct.stock_kg} kg
    </label>

    <div className="flex gap-2">
      <input
        type="number"
        name="addedStock"
        placeholder="Add stock"
        onChange={handleEditChange}
        className="w-full border rounded-lg px-3 py-2"
      />

      <select
        name="stockType"
        value={formValues.stockType}
        onChange={handleEditChange}
        className="border rounded-lg px-2"
      >
        <option value="kg">kg</option>
        <option value="g">g</option>
      </select>
    </div>
  </div>

</div>
        
     <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Category
  </label>

  <select
    name="category"
    value={formValues.category}
    onChange={handleEditChange}
    required
    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white"
  >
    <option value="">Select Category</option>

    {categories.map((cat) => (
      <option key={cat._id} value={cat._id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>

      

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formValues.description}
          onChange={handleEditChange}
          rows="3"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Upload Images
        </label>
        <input
          type="file"
          name="images"
          multiple
          onChange={handleEditChange}
          className="w-full border rounded-lg px-3 py-2 bg-gray-50"
        />
      </div>

      {/* Image Preview */}
      {editingProduct.images?.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Current Images
          </label>

          <div className="flex gap-2 flex-wrap">
            {editingProduct.images.map((img, i) => (
              <img
                key={i}
                src={`${backendURL}/uploads/${img}`}
                className="w-16 h-16 rounded object-cover border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">

        <button
          type="button"
          onClick={() => setEditingProduct(null)}
          className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
        >
          Update Product
        </button>

      </div>

    </form>

  </div>
)}

    </div>
  );
};

export default ProductList;
