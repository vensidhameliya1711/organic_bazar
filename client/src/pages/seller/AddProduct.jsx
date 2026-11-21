import { assets } from "../../assets/assets";
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

/* CATEGORY LIST */
// const categories = [
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

const AddProduct = () => {
  const { addProduct } = useAppContext();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [unit_pack_kg, setUnitPackKg] = useState("");
  const [unitType, setUnitType] = useState("kg");
const [stockType, setStockType] = useState("kg");
  const [stock_kg, setStockKg] = useState("");  
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  // const [HarvestDate, setHarvestDate] = useState("");
  // const [ExpiryDate, setExpiryDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  /* IMAGE HANDLER */
  const handleImageChange = (index, file) => {
    if (!file) return;

    const updated = [...files];
    updated[index] = file;
    setFiles(updated);
  };

  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  /* AUTO CLEAR WRONG EXPIRY */
  useEffect(() => {
        fetchCategories();
    // if (
    //   HarvestDate &&
    //   ExpiryDate &&
    //   new Date(ExpiryDate) < new Date(HarvestDate)
    // ) {
    //   setExpiryDate("");
  
    // }
  }, []);

  /* VALIDATION */
  const validateForm = () => {
    let newErrors = {};

    if (!name.trim()) newErrors.name = "Product name required";

    if (!unit_pack_kg || unit_pack_kg <= 0)
      newErrors.unit_pack_kg = "Valid unit pack weight required";

    if (!stock_kg || stock_kg <= 0)
      newErrors.stock_kg = "Valid stock quantity required";


    if (!description.trim())
      newErrors.description = "Description required";

    if (!category) newErrors.category = "Select category";

    if (!price || price <= 0)
      newErrors.price = "Valid price required";

    if (!offerPrice || offerPrice <= 0)
      newErrors.offerPrice = "Valid offer price required";

    if (Number(offerPrice) >= Number(price))
      newErrors.offerPrice =
        "Offer price must be less than original price";

    
   
    if (files.length === 0)
      newErrors.images = "Upload at least one image";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const fetchCategories = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/category");
    const data = await res.json();

    if (data.success) {
      setCategories(data.data);
    }
  } catch (err) {
    console.error("Category fetch error:", err);
  }
};


  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix errors");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("unit_pack_kg", Number(unit_pack_kg));
      formData.append("unitType", unitType);
      formData.append("stock_kg", Number(stock_kg));

formData.append("stockType", stockType);
      formData.append("price", Number(price));
      formData.append("offerPrice", Number(offerPrice));
      

      files.forEach((file) =>
        formData.append("images", file)
      );

      const res = await addProduct(formData);

      if (res?.success) {
        toast.success("Product added successfully 🌿");

        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
          setUnitPackKg("");  
          setStockKg("");
       
        setFiles([]);
        setErrors({});
      } else {
        toast.error(res?.message);
      }
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border p-8">

        {/* HEADER */}
        <div className="border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Add New Product
          </h2>

          <p className="text-gray-500 text-sm">
            Add product details, pricing, and expiry information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* IMAGES */}
          <div>
            <label className="form-label">
              Product Images *
            </label>

            <div className="flex gap-4 flex-wrap mt-2">
              {[0, 1, 2, 3].map((i) => (
                <label
                  key={i}
                  className="relative cursor-pointer"
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(
                        i,
                        e.target.files[0]
                      )
                    }
                  />

                  <img
                    src={
                      files[i]
                        ? URL.createObjectURL(files[i])
                        : assets.upload_area
                    }
                    className="w-24 h-24 object-cover border rounded-lg hover:shadow-md"
                  />

                  {files[i] && (
                    <button
                      type="button"
                      onClick={() =>
                        removeImage(i)
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </label>
              ))}
            </div>

            {errors.images && (
              <p className="error">
                {errors.images}
              </p>
            )}
          </div>

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="form-label">
                Product Name *
              </label>

              <input
                className="input"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              {errors.name && (
                <p className="error">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                Category *
              </label>

             <select
  className="input"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select category</option>

  {categories.map((cat) => (
    <option key={cat._id} value={cat.name}>
      {cat.name}
    </option>
  ))}
</select>

              {errors.category && (
                <p className="error">
                  {errors.category}
                </p>
              )}
            </div>

          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="form-label">
              Description *
            </label>

            <textarea
              rows={3}
              className="input"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

            {errors.description && (
              <p className="error">
                {errors.description}
              </p>
            )}
          </div>

          {/* UNIT PACK & STOCK */}
         <div>
  <label className="form-label">
    Unit Pack *
  </label>

  <div className="flex gap-2">
    <input
      type="number"
      className="input"
      placeholder="e.g. 100"
      value={unit_pack_kg}
      onChange={(e) => setUnitPackKg(e.target.value)}
    />

    <select
      className="input w-32"
      value={unitType}
      onChange={(e) => setUnitType(e.target.value)}
    >
      <option value="kg">KG</option>
      <option value="g">Gram</option>
    </select>
  </div>
  <p className="text-sm text-gray-500 mt-1">
  1 unit = {unit_pack_kg} {unitType}
</p>

  {errors.unit_pack_kg && (
    <p className="error">{errors.unit_pack_kg}</p>
  )}
</div>
<div>
  <label className="form-label">
    Stock *
  </label>

  <div className="flex gap-2">
    <input
      type="number"
      className="input"
      placeholder="e.g. 5"
      value={stock_kg}
      onChange={(e) => setStockKg(e.target.value)}
    />

    <select
      className="input w-32"
      value={stockType}
      onChange={(e) => setStockType(e.target.value)}
    >
      <option value="kg">KG</option>
      <option value="g">Gram</option>
    </select>
  </div>
  <p className="text-sm text-gray-500">
  Total stock = {stock_kg} {stockType}
</p>

  {errors.stock_kg && (
    <p className="error">{errors.stock_kg}</p>
  )}
</div>
          {/* PRICING */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="form-label">
                Price *
              </label>

              <input
                type="number"
                className="input"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />

              {errors.price && (
                <p className="error">
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                Offer Price *
              </label>

              <input
                type="number"
                className="input"
                value={offerPrice}
                onChange={(e) =>
                  setOfferPrice(
                    e.target.value
                  )
                }
              />

              {errors.offerPrice && (
                <p className="error">
                  {errors.offerPrice}
                </p>
              )}
            </div>

          </div>

         

          {/* SUBMIT */}
          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-2 rounded-lg hover:bg-emerald-700"
            >
              Add Product
            </button>
          </div>

        </form>

      </div>

      {/* STYLES */}
      <style>{`
        .input{
          width:100%;
          padding:10px;
          border:1px solid #ddd;
          border-radius:8px;
        }

        .form-label{
          font-weight:600;
          font-size:14px;
          display:block;
          margin-bottom:6px;
        }

        .error{
          color:red;
          font-size:12px;
          margin-top:3px;
        }
      `}</style>

    </div>
  );
};

export default AddProduct;
