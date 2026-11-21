


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const slides = [
  {
    id: 1,
    image: assets.banner1,
    image_sm: assets.main_banner_bg_sm,
    title: "Freshness You Can Trust, Savings You Will Love!",
  },
  {
    id: 2,
    image: assets.pcb,
    image_sm: assets.banner3_sm,
    title: "Premium Organic Products — Delivered to Your Door!",
  },
  {
    id: 3,
    image: assets.banner2,
    image_sm: assets.banner2_sm,
    title: "Eat Healthy. Live Better. Shop Fresh Today!",
  },
  {
    id: 4,
    image: assets.f,
    image_sm: assets.banner4_sm,
    title: "100% Natural. 100% Trusted. Shop Organic Essentials!",
  },
];

const Banner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      
      {/* SLIDER */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full h-screen">
            
            {/* DESKTOP IMAGE */}
            <img
              src={slide.image}
              alt="Banner"
              className="hidden md:block w-full h-full object-cover"
              loading="eager"
            />

            {/* MOBILE IMAGE */}
            <img
              src={slide.image_sm}
              alt="Banner Mobile"
              className="md:hidden w-full h-full object-cover"
              loading="eager"
            />

            {/* OVERLAY CONTENT */}
            <div className="absolute inset-0 flex flex-col justify-center 
                            items-center md:items-start 
                            px-6 md:px-16 lg:px-24">

              {/* Title with green + blue gradient */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl 
                             font-bold max-w-2xl leading-tight 
                             text-center md:text-left
                             bg-gradient-to-r from-green-400 via-blue-400 to-blue-600
                             bg-clip-text text-transparent">
                {slide.title}
              </h1>

              {/* Shop Now Button with light blue → dark blue gradient */}
              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 
                           px-8 py-4 rounded-xl 
                           bg-gradient-to-r from-blue-400 to-blue-600
                           hover:from-blue-500 hover:to-blue-700
                           font-semibold transition shadow-lg
                           text-white"
              >
                Shop Now
                <img
                  src={assets.white_arrow_icon}
                  alt="Arrow"
                  className="md:hidden"
                />
              </Link>

            </div>

          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all
              ${current === index ? "bg-blue-500 scale-125" : "bg-white/50"}`}
          />
        ))}
      </div>

    </section>
  );
};

export default Banner;
