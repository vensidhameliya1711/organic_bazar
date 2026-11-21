import React from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/main.jpg";

export default function MainPage() {
  const navigate = useNavigate();

  const categories = [
    { name: "Fruits", img: "https://cdn-icons-png.flaticon.com/512/590/590685.png" },
    { name: "Vegetables", img: "https://cdn-icons-png.flaticon.com/512/2153/2153788.png" },
    { name: "Dry Fruits", img: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" },
    { name: "Spices", img: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" },
    { name: "Personal Care", img: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png" },
    { name: "Groceries", img: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png" },
  ];

  const products = [
    {
      name: "Organic Apples",
      price: "₹180/kg",
      img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",
    },
    {
      name: "Fresh Tomatoes",
      price: "₹40/kg",
      img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
    },
    {
      name: "Almonds",
      price: "₹750/kg",
      img: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400",
    },
    {
      name: "Organic Turmeric",
      price: "₹220/kg",
      img: "https://images.unsplash.com/photo-1615486363979-86b0e5b2c1b0?w=400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

          <h1 className="text-2xl font-bold text-teal-700 cursor-pointer"
              onClick={() => navigate("/")}>
            Organic Bazar 🌿
          </h1>

          <div className="hidden md:flex gap-8 font-medium text-gray-600">
            <span className="hover:text-teal-600 cursor-pointer">Home</span>
            <span className="hover:text-teal-600 cursor-pointer">Shop</span>
            <span className="hover:text-teal-600 cursor-pointer">Categories</span>
            <span className="hover:text-teal-600 cursor-pointer">Contact</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50">
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              Register
            </button>
          </div>

        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-center px-6 md:px-16 py-16 gap-10">

        <div className="md:w-1/2">
          <h1 className="text-5xl font-extrabold text-teal-800 mb-6">
            100% Organic Products Delivered to Your Home 🌿
          </h1>

          <p className="text-gray-600 mb-8">
            Buy fresh fruits, vegetables, groceries, and organic products directly from farmers.
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700">
            Shop Now
          </button>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <img src={heroImage}
               className="rounded-3xl shadow-xl w-[80%]" />
        </div>

      </section>

      {/* CATEGORIES */}
      <section className="py-16 bg-white">

        <h2 className="text-3xl font-bold text-center text-teal-800 mb-12">
          Shop by Category
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-6">

          {categories.map((cat, i) => (
            <div key={i}
                 className="bg-teal-50 rounded-xl p-6 text-center cursor-pointer hover:shadow-lg">

              <img src={cat.img}
                   className="w-16 mx-auto mb-4" />

              <h3 className="font-semibold text-teal-800">
                {cat.name}
              </h3>

            </div>
          ))}

        </div>

      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-16">

        <h2 className="text-3xl font-bold text-center text-teal-800 mb-12">
          Featured Products
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6">

          {products.map((product, i) => (
            <div key={i}
                 className="bg-white rounded-xl shadow hover:shadow-xl transition">

              <img src={product.img}
                   className="rounded-t-xl h-48 w-full object-cover" />

              <div className="p-5">

                <h3 className="font-semibold text-lg">
                  {product.name}
                </h3>

                <p className="text-teal-600 font-bold">
                  {product.price}
                </p>

                <button
                  className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">
                  Add to Cart
                </button>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* OFFER BANNER */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-center">

        <h2 className="text-4xl font-bold mb-4">
          Get 20% Off on First Order 🎉
        </h2>

        <button
          onClick={() => navigate("/register")}
          className="bg-white text-teal-700 px-8 py-3 rounded-xl font-semibold">
          Claim Offer
        </button>

      </section>

      {/* FEATURES */}
      <section className="py-16 bg-white">

        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center px-6">

          <div>
            <div className="text-4xl">🥬</div>
            <h3 className="font-bold mt-3">Farm Fresh</h3>
          </div>

          <div>
            <div className="text-4xl">🚚</div>
            <h3 className="font-bold mt-3">Fast Delivery</h3>
          </div>

          <div>
            <div className="text-4xl">🔒</div>
            <h3 className="font-bold mt-3">Secure Payment</h3>
          </div>

          <div>
            <div className="text-4xl">⭐</div>
            <h3 className="font-bold mt-3">Best Quality</h3>
          </div>

        </div>

      </section>

      {/* NEWSLETTER */}
      <section className="py-16 text-center">

        <h2 className="text-3xl font-bold text-teal-800 mb-4">
          Subscribe to Newsletter
        </h2>

        <input
          placeholder="Enter your email"
          className="px-4 py-3 rounded-lg border w-72 mr-4"
        />

        <button className="bg-teal-600 text-white px-6 py-3 rounded-lg">
          Subscribe
        </button>

      </section>

      {/* FOOTER */}
      <footer className="bg-teal-900 text-white text-center py-6">
        © 2026 Organic Bazar. All rights reserved.
      </footer>

    </div>
  );
}
