// pages/Home.jsx
import Banner from "../components/Banner";
import BestSeller from "../components/BestSeller";
import Category from "../components/Category";


const Home = () => {
  return (
    <main className="mt-10">
      <Banner />
      <section aria-labelledby="category-heading">
        <Category />
      </section>
      <section aria-labelledby="bestseller-heading">
        <BestSeller />
        </section>
       
      
      {/* <section aria-labelledby="newsletter-heading">
        <NewsLetter />
      </section> */}
    </main>
  );
};

export default Home;