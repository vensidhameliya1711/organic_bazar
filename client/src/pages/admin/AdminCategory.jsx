import React, { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000/api/category";

function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [trash, setTrash] = useState([]);
  const [showTrash, setShowTrash] = useState(false);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null); // store actual File
  const [preview, setPreview] = useState(""); // for image preview
  const [bgColor, setBgColor] = useState("");
  const [editId, setEditId] = useState(null);

  // FETCH
  const fetchCategories = async () => {
    const res = await fetch(BASE_URL, { credentials: "include" });
    const data = await res.json();
    setCategories(data.data || []);
  };

  const fetchTrash = async () => {
    const res = await fetch(`${BASE_URL}/trash`, { credentials: "include" });
    const data = await res.json();
    setTrash(data.data || []);
  };

  useEffect(() => {
    fetchCategories();
    fetchTrash();
  }, []);

  // ADD / UPDATE
 const handleSubmit = async () => {
  if (!name) return;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("bgColor", bgColor);

  // file append
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput && fileInput.files[0]) {
    formData.append("image", fileInput.files[0]);
  }

  const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
  const method = editId ? "PUT" : "POST";

  await fetch(url, {
    method,
    credentials: "include",
    body: formData, // no JSON
  });

  setName("");
  setBgColor("");
  setImage("");
  setEditId(null);

  fetchCategories();
  fetchTrash();
};
  // DELETE
  const handleDelete = async (id) => {
    await fetch(`${BASE_URL}/delete/${id}`, {
      method: "PUT",
      credentials: "include"
    });
    fetchCategories();
    fetchTrash();
  };

  // RESTORE
  const handleRestore = async (id) => {
    await fetch(`${BASE_URL}/restore/${id}`, {
      method: "PUT",
      credentials: "include"
    });
    fetchCategories();
    fetchTrash();
  };

  // EDIT
  const handleEdit = (cat) => {
    setName(cat.name);
    setBgColor(cat.bgColor);
    setEditId(cat._id);
    setPreview(cat.image); // show existing image
    setImage(null); // reset File, user can upload new one if needed
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">📂 Category Management</h2>

      {/* Toggle */}
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setShowTrash(false)}
          className={`px-4 py-2 rounded ${!showTrash ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Active
        </button>
        <button
          onClick={() => setShowTrash(true)}
          className={`px-4 py-2 rounded ${showTrash ? "bg-red-500 text-white" : "bg-gray-200"}`}
        >
          Trash
        </button>
      </div>

      {/* FORM CARD */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">{editId ? "Edit Category" : "Add Category"}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file); // store File object
                setPreview(URL.createObjectURL(file)); // preview
              }
            }}
          />

          {preview && <img src={preview} className="w-16 mt-2 rounded" alt="Preview" />}

          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-16 h-10 p-1 border"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-3 bg-green-500 text-white px-4 py-2 rounded"
        >
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* CATEGORY LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">
          {showTrash ? "🗑️ Trash Categories" : "Active Categories"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showTrash ? trash : categories).map((cat) => (
            <div
              key={cat._id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={cat.image ? `http://localhost:5000/uploads/${cat.image}` : ""}
                  alt={cat.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{cat.name}</p>
                </div>
              </div>

              <div className="space-x-2">
                {!showTrash ? (
                  <>
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-yellow-400 px-2 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestore(cat._id)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {(showTrash ? trash : categories).length === 0 && (
          <p className="text-gray-500 mt-4">No categories found</p>
        )}
      </div>
    </div>
  );
}

export default AdminCategory;