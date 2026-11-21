// components/Footer.jsx

const Footer = () => {
  return (
    <footer className="text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-wrap justify-between gap-12 md:gap-6">
        {/* Brand & Social */}
        <div className="max-w-80">
          <h1 className="text-3xl font-semibold text-[#212121]">Organic Bazar</h1>
          <p className="text-sm mt-2">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {/* Social Icons */}
            {["Instagram", "Facebook", "Twitter", "LinkedIn"].map((platform, index) => (
              <svg
                key={index}
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-label={platform}
              >
                {/* SVG paths omitted for brevity — keep your originals here */}
              </svg>
            ))}
          </div>
        </div>

        {/* Company Links */}
        <div>
          <p className="text-lg text-gray-800">COMPANY</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {["About", "Careers", "Press", "Blog", "Partners"].map((item, i) => (
              <li key={i}>
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <p className="text-lg text-gray-800">SUPPORT</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {["Help Center", "Safety Information", "Cancellation Options", "Contact Us", "Accessibility"].map((item, i) => (
              <li key={i}>
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="max-w-80">
          <p className="text-lg text-gray-800">STAY UPDATED</p>
          <p className="mt-3 text-sm">
            Subscribe to our newsletter for inspiration and special offers.
          </p>
          <div className="flex items-center mt-4">
            <input
              type="email"
              className="bg-white rounded-l border border-gray-300 h-9 px-3 outline-none"
              placeholder="Your email"
              aria-label="Email address"
            />
            <button
              className="flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r"
              aria-label="Subscribe"
            >
              <svg
                className="w-4 h-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 12H5m14 0-4 4m4-4-4-4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <hr className="border-gray-300 mt-8" />
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-5 text-sm">
        <p>© {new Date().getFullYear()} Organic Bazar. All rights reserved.</p>
        <ul className="flex items-center gap-4">
          {["Privacy", "Terms", "Sitemap"].map((item, i) => (
            <li key={i}>
              <a href="#">{item}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;