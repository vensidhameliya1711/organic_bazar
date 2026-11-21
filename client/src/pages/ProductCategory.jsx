import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  const allProducts = Array.isArray(products) ? products : [];
  const normalizedCategory = category?.toLowerCase();

  // ✅ Get category info from products (DB)
  const currentCategory = allProducts.find(
    (p) => p.category?.slug?.toLowerCase() === normalizedCategory
  )?.category;

  // ✅ Filter products by category slug
  const filteredProducts = allProducts.filter(
    (product) =>
      product.category?.slug?.toLowerCase() === normalizedCategory
  );

  return (
    <main className="mt-20 px-6 md:px-16 lg:px-24">

      {/* ✅ CATEGORY TITLE */}
      {currentCategory && (
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700">
            {currentCategory.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Explore the best {currentCategory.name.toLowerCase()} available.
          </p>
        </header>
      )}

      {/* ✅ PRODUCT LIST */}
      {filteredProducts.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      ) : (
        <section className="text-center mt-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-red-500">
            No products found
          </h2>
        </section>
      )}
    </main>
  );
};

export default ProductCategory;