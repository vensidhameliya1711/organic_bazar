import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const Category = () => {
  const { navigate } = useAppContext();
  const [categories, setCategories] = useState([]);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/category"); // active categories
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
    return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-medium text-center">
        Categories
      </h2>

      <div
        className="
          mt-8 
          grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-5 
          gap-6 
          px-4
        "
      >
        {categories.map((category) => (
          <button
            key={category._id}
            className="
              group 
              border border-gray-200 
              rounded-xl 
              p-5 
              flex flex-col 
              items-center 
              justify-center
              shadow-sm 
              hover:shadow-md 
              transition
            "
            style={{ backgroundColor: category.bgColor || "#fff" }}
            onClick={() => {
              navigate(`/products/${category.slug}`); // use slug or path
              window.scrollTo(0, 0);
            }}
          >
            {/* Image */}
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src={category.image ? `http://localhost:5000/uploads/${category.image}` : ""}
                alt={category.name}
                className="
                  w-full 
                  h-full 
                  object-contain 
                  transition 
                  group-hover:scale-110
                "
              />
            </div>

            {/* Text */}
            <p className="mt-3 text-sm font-medium text-gray-700 text-center">
              {category.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Category;