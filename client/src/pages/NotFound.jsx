// pages/ProductCategory.jsx

import { categories } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  // ✅ Ensure products is an array
  const allProducts = Array.isArray(products) ? products : [];

  const normalizedCategory = category?.toLowerCase();
  const searchCategory = categories.find(
    (item) => item.path.toLowerCase() === normalizedCategory
  );

  // ✅ Safe filtering
  const filteredProducts = allProducts.filter(
    (product) => product.category?.toLowerCase() === normalizedCategory
  );

  return (
    <main className="mt-16">
      {searchCategory && (
        <header className="flex flex-col items-end w-max mb-6">
          <h1 className="text-3xl md:text-4xl font-medium">
            {searchCategory.text.toUpperCase()}
          </h1>
        </header>
      )}

      {filteredProducts.length > 0 ? (
        <section
          aria-label={`${searchCategory?.text || "Category"} products`}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      ) : (
        <section className="text-center mt-10">
          <h2 className="text-3xl md:text-4xl font-medium">No products found</h2>
        </section>
      )}
    </main>
  );
};
