import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const BestSeller = () => {
  const { api } = useAppContext();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch best sellers directly from backend
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/products/best-sellers");

        if (data.success && Array.isArray(data.products)) {
          setBestSellers(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [api]);

  return (
    <section className="mt-16 px-4">
      <h2 className="text-2xl md:text-3xl font-medium mb-6 text-center">
        Best Sellers
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {loading ? (
          <p className="col-span-full text-center">Loading...</p>
        ) : bestSellers.length > 0 ? (
          bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center">No best seller products</p>
        )}
      </div>
    </section>
  );
};

export default BestSeller;
