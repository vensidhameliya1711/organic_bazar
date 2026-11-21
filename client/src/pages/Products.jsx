import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";

const Products = () => {

  const {
    products,
    searchQuery,
    api,          // ✅ use api instead of axios
    setProducts,
  } = useAppContext();

  const [priceFilter, setPriceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  /* ================= FETCH PRODUCTS ================= */


  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const { data } = await api.get("/api/products"); // ✅ api used

        if (data.success && Array.isArray(data.products)) {

          const activeProducts = data.products.filter(
            (p) => p.isDeleted === 1
          );

          setProducts(activeProducts);

        } else {

          setProducts([]);

        }

      } catch (err) {

        console.error("Failed to fetch products:", err);

        setProducts([]);

      }

    };

    const fetchCategories = async () => {
  try {
    const { data } = await api.get("/api/category");

    if (data.success) {
      setCategories(data.data);
    }
  } catch (err) {
    console.error("Category fetch error:", err);
  }
};

    fetchProducts();
    fetchCategories();

  }, [api, setProducts]); // ✅ dependency updated



  /* ================= FILTER & SEARCH ================= */

  useEffect(() => {

    let allProducts = Array.isArray(products) ? [...products] : [];

    const query = searchQuery?.trim().toLowerCase() || "";

    // Search filter
    if (query) {

      allProducts = allProducts.filter((p) =>
        p.name?.toLowerCase().includes(query)
      );

    }

    // Price filter
    if (priceFilter !== "all") {

      const [min, max] = priceFilter.split("-").map(Number);

      allProducts = allProducts.filter((p) => {

        const price = Number(p.offerPrice ?? p.price);

        return price >= min && price <= max;

      });

    }

    // Category filter
    if (categoryFilter !== "all") {

     allProducts = allProducts.filter(
  (p) =>
    p.category?.name?.toLowerCase() === categoryFilter.toLowerCase()
);

    }

    // Availability filter
    if (availabilityFilter !== "all") {

      allProducts = allProducts.filter(
        (p) =>
          p.inStock === (availabilityFilter === "inStock")
      );

    }

    // Sort by price low → high
    allProducts.sort(
      (a, b) =>
        (a.offerPrice ?? a.price) -
        (b.offerPrice ?? b.price)
    );

    setFilteredProducts(allProducts);

  }, [
    products,
    searchQuery,
    priceFilter,
    categoryFilter,
    availabilityFilter,
  ]);



  return (

    <main className="mt-16 px-4 lg:px-16">

      <h1 className="text-3xl lg:text-4xl font-semibold mb-6">
        All Products
      </h1>


      {/* ================= FILTERS ================= */}

      <div className="flex flex-wrap gap-4 mb-8 items-center justify-start">

        {/* Price */}
        <select
          value={priceFilter}
          onChange={(e) =>
            setPriceFilter(e.target.value)
          }
          className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <option value="all">All Prices</option>
          <option value="0-99">₹0 - ₹99</option>
          <option value="100-199">₹100 - ₹199</option>
          <option value="200-299">₹200 - ₹299</option>
          <option value="300-499">₹300 - ₹499</option>
          <option value="500-999999">₹500+</option>
        </select>


        {/* Category */}
       <select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
>
  <option value="all">All Categories</option>

  {categories.length === 0 ? (
    <option disabled>Loading...</option>
  ) : (
    categories.map((cat) => (
     <option key={cat._id} value={cat.name}>
  {cat.name}
</option>
    ))
  )}
</select>
        {/* Availability */}
        <select
          value={availabilityFilter}
          onChange={(e) =>
            setAvailabilityFilter(e.target.value)
          }
          className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <option value="all">All</option>
          <option value="inStock">In Stock</option>
          <option value="outOfStock">Out of Stock</option>
        </select>

      </div>



      {/* ================= PRODUCTS GRID ================= */}

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

        {filteredProducts.length > 0 ? (

          filteredProducts.map((product) => (

            <ProductCard
              key={product._id}
              product={product}
            />

          ))

        ) : (

          <div className="col-span-full text-center text-gray-400 mt-16">

            <p className="text-2xl mb-2">
              🚫 No products found
            </p>

            <p className="text-gray-500">
              Try adjusting your filters or search query.
            </p>

          </div>

        )}

      </section>

    </main>

  );

};

export default Products;
