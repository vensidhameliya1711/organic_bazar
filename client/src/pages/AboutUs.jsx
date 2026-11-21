// // pages/AboutUs.jsx
// import { Link } from "react-router-dom";
// import aboutus from "../assets/about_us1.jpg";
// import aboutus1 from "../assets/about_us2.jpg";
// import aboutus2 from "../assets/about_us3.jpg";

// const AboutUs = () => {
//   return (
//     <main className="mt-16 px-6 md:px-16 lg:px-24 space-y-16">
      
//       {/* Hero Section */}
//       <section className="flex flex-col lg:flex-row items-center gap-8">
//         <div className="flex-1">
//           <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
//             About Organic Bazar
//           </h1>
//           <p className="text-gray-700 text-lg md:text-xl">
//             At Organic Bazar, we bring fresh, organic products from local farmers 
//             directly to your doorstep. We are committed to quality, sustainability, 
//             and supporting our community.
//           </p>
//         </div>
//         <div className="flex-1">
//           <img
//             src={aboutus}
//             alt="About Organic Bazar"
//             className="w-full rounded-lg shadow-lg"
//           />
//         </div>
//       </section>

//       {/* Mission Section */}
//       <section className="bg-green-100 p-8 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-8">
//         <div className="flex-1">
//           <img
//             src={aboutus1}
//             alt="Our Mission"
//             className="w-full rounded-lg shadow-md"
//           />
//         </div>
//         <div className="flex-1">
//           <h2 className="text-3xl font-semibold text-green-700 mb-3">Our Mission</h2>
//           <p className="text-gray-700">
//             To provide fresh, organic, and locally-sourced products that promote 
//             a healthy lifestyle, while supporting local farmers and sustainable 
//             practices.
//           </p>
//         </div>
//       </section>

//       {/* Vision Section */}
//       <section className="flex flex-col md:flex-row items-center gap-8">
//         <div className="flex-1 order-2 md:order-1">
//           <h2 className="text-3xl font-semibold text-green-700 mb-3">Our Vision</h2>
//           <p className="text-gray-700">
//             To become the leading online marketplace for organic and sustainable 
//             products, connecting conscious consumers with trusted local producers 
//             across the country.
//           </p>
//         </div>
//         <div className="flex-1 order-1 md:order-2">
//           <img
//             src={aboutus2}
//             alt="Our Vision"
//             className="w-full rounded-lg shadow-md"
//           />
//         </div>
//       </section>

//       {/* Values Section */}
//       <section className="bg-green-100 p-8 rounded-lg shadow-md">
//         <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">
//           Our Core Values
//         </h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//           {[
//             { title: "Quality", desc: "Top-quality organic products for our customers." },
//             { title: "Sustainability", desc: "Eco-friendly practices in every step." },
//             { title: "Community", desc: "Supporting local farmers and businesses." },
//             { title: "Trust", desc: "Transparent sourcing and reliable delivery." },
//           ].map((value, idx) => (
//             <div key={idx} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
//               <h3 className="font-semibold text-lg text-green-700 mb-2">{value.title}</h3>
//               <p className="text-gray-700 text-sm">{value.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="text-center py-12">
//         <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
//           Join Our Community
//         </h2>
//         <p className="text-gray-700 mb-6">
//           Sign up today to get the freshest products and exclusive offers delivered 
//           to your doorstep.
//         </p>

//         <Link to="/products">
//           <button className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition">
//             Shop Now
//           </button>
//         </Link>
//       </section>

//     </main>
//   );
// };

// export default AboutUs;

// pages/AboutUs.jsx
import { Link } from "react-router-dom";
import aboutus from "../assets/about_us1.jpg";
import aboutus1 from "../assets/about_us2.jpg";
import aboutus2 from "../assets/about_us3.jpg";

const AboutUs = () => {
  return (
    <main className="mt-16 space-y-20">

      {/* Hero Section */}
      <section className="px-6 md:px-16 lg:px-24 py-16 bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-100">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-800 mb-5">
              About Organic Bazar
            </h1>
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
              At Organic Bazar, we bring fresh, organic products from local farmers
              directly to your doorstep. We are committed to quality, sustainability,
              and supporting our community.
            </p>
          </div>

          <div className="flex-1">
            <img
              src={aboutus}
              alt="About Organic Bazar"
              className="w-full rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 md:px-16 lg:px-24">
        <div className="bg-gradient-to-br from-cyan-100 via-teal-100 to-emerald-100 p-10 rounded-3xl shadow-lg flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <img
              src={aboutus1}
              alt="Our Mission"
              className="w-full rounded-2xl shadow-md"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To provide fresh, organic, and locally-sourced products that promote
              a healthy lifestyle, while supporting local farmers and sustainable
              practices.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">
              Our Vision
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To become the leading online marketplace for organic and sustainable
              products, connecting conscious consumers with trusted local producers
              across the country.
            </p>
          </div>

          <div className="flex-1 order-1 md:order-2">
            <img
              src={aboutus2}
              alt="Our Vision"
              className="w-full rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 md:px-16 lg:px-24 py-16 bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-100">
        <h2 className="text-3xl font-extrabold text-emerald-800 mb-10 text-center">
          Our Core Values
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { title: "Quality", desc: "Top-quality organic products for our customers." },
            { title: "Sustainability", desc: "Eco-friendly practices in every step." },
            { title: "Community", desc: "Supporting local farmers and businesses." },
            { title: "Trust", desc: "Transparent sourcing and reliable delivery." },
          ].map((value, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <h3 className="font-semibold text-xl text-emerald-700 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-16 lg:px-24 py-20 text-center bg-gradient-to-r from-teal-100 via-cyan-100 to-emerald-100">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-800 mb-5">
          Join Our Community
        </h2>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
          Sign up today to get the freshest products and exclusive offers delivered
          to your doorstep.
        </p>

        <Link to="/products">
          <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition">
            Shop Now
          </button>
        </Link>
      </section>

    </main>
  );
};

export default AboutUs;

