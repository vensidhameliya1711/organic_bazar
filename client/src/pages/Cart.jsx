import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";


// ------------------ Calculate final price with expiry discount ------------------

const Cart = () => {
  const { products, navigate, cartItems, setCartItems, user, removeFromCart, addToCart, api } =
    useAppContext();
  
    // Calculate final price for a product based on offerPrice (if available) and quantity
const getFinalPrice = (product, quantity = 1) => {
  // Use offerPrice if available, otherwise normal price
  const unitPrice = product.offerPrice ?? product.price ?? 0;

  // Multiply by quantity and round to 2 decimals
  const totalPrice = parseFloat((unitPrice * quantity).toFixed(2));

  return totalPrice;
};

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [cartArray, setCartArray] = useState([]);
  const [address, setAddress] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentType, setPaymentType] = useState("COD");
  const [orderId, setOrderId] = useState(null);

  // ---------------- Prepare cart array for display ----------------
  useEffect(() => {
    if (!products.length) return;

    const tempArray = Object.entries(cartItems || {})
      .map(([id, qtyObj]) => {
        if (!qtyObj || qtyObj.quantity <= 0) return null;

        const product = products.find((p) => p._id === id);
        if (!product) return null;

        return {
          ...product,
          quantity: qtyObj.quantity,
          price: getFinalPrice(product),
          image: product.images?.[0] || "default.jpg",
        };
      })
      .filter(Boolean);

    setCartArray(tempArray);
  }, [products, cartItems]);

  // ---------------- Fetch user addresses ----------------
  useEffect(() => {
    if (user) fetchAddress();
  }, [user]);

  const fetchAddress = async () => {
    try {
      const res = await fetch(`${backendURL}/api/address/get`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setAddress(data.addresses || []);
        if (data.addresses.length) setSelectedAddress(data.addresses[0]);
      }
    } catch (err) {
      toast.error("Failed to fetch addresses");
    }
  };

  const getImageUrl = (img) =>
    img?.startsWith("/") ? `${backendURL}${img}` : `${backendURL}/uploads/${img}`;

  // ---------------- Update quantity ----------------
  const updateCartItem = async (id, quantity) => {
    if (!user) return toast.error("Login first");
    if (quantity <= 0) return;

    const updated = { ...cartItems, [id]: { ...cartItems[id], quantity } };
    setCartItems(updated);

    // Sync backend
    const cartArray = Object.entries(updated).map(([pid, item]) => ({
      productId: pid,
      quantity: item.quantity,
    }));

    try {
      await api.post("/api/cart/update", { cartItems: cartArray });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update cart");
    }
  };

  // ---------------- Total Amount ----------------
  const totalCartAmount = cartArray.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalWithTax = (totalCartAmount * 1.02).toFixed(2);

  // ---------------- Place Order ----------------
 const handlePlaceOrder = async () => {
  if (!selectedAddress) return toast.error("Please select an address");
  if (!cartArray.length) return toast.error("Cart is empty");

  try {
    // Step 1: Place order in your database
    const res = await fetch(`${backendURL}/api/orders/place`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartArray.map(({ _id, quantity, price }) => ({
          product: _id,
          quantity,
          price,
          
        })),
        addressId: selectedAddress._id,
        paymentType,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      return toast.error(data.message || "Order failed");
    }

    const order = data.order;

    // ---------------- COD ----------------
    if (paymentType === "COD") {
      toast.success("Order placed successfully");

      setCartItems({});
      localStorage.removeItem("cartItems");

      navigate("/my-orders");
      return;
    }

    // ---------------- ONLINE PAYMENT ----------------

    // Step 2: Create Razorpay order from backend
    const razorpayRes = await api.post("/api/orders/create-order", {
      orderId: order._id,
    });

    const razorpayData = razorpayRes.data;

    if (!razorpayData.success) {
      return toast.error("Failed to initiate payment");
    }

    // Step 3: Razorpay options
const options = {
  key: razorpayData.key,
  amount: razorpayData.order.amount,
  currency: razorpayData.order.currency,
  name: "Organic Bazar",
  description: "Order Payment",
  order_id: razorpayData.order.id,

  // ✅ Enable UPI (QR + UPI ID दोनों)
  method: {
    upi: true,
    card: true,
    netbanking: true,
    wallet: true,
  },

  config: {
    display: {
      blocks: {
        upi: {
          name: "Pay using UPI",
          instruments: [
            {
              method: "upi",
              flows: ["collect", "intent"] // ✅ IMPORTANT (UPI ID + Apps)
            }
          ]
        }
      },
      sequence: ["block.upi"],
      preferences: {
        show_default_blocks: true
      }
    }
  },

  handler: async function (response) {
    try {
      const verifyRes = await api.post("/api/orders/verify-payment", {
        orderId: order._id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (verifyRes.data.success) {
        toast.success("Payment successful");

        setCartItems({});
        localStorage.removeItem("cartItems");

        navigate("/my-orders");
      } else {
        toast.error("Payment verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification error");
    }
  },

  prefill: {
    name: user?.name,
    email: user?.email,
  },

  theme: {
    color: "#6366f1",
  },
};

    // Step 4: Open Razorpay popup
    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      toast.error("Payment failed");
    });

    rzp.open();

  } catch (err) {
    console.error(err);
    toast.error("Payment error");
  }
};

  if (!products.length)
    return <p className="mt-16 text-center text-gray-500">Loading Cart...</p>;

  return (
    <main className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto gap-8">
      {/* Cart Items */}
      <section className="flex-1">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-sm text-indigo-500">{cartArray.length} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base font-medium pt-3 text-gray-500"
          >
            <div className="flex items-center gap-3 md:gap-6">
              <div
                onClick={() => {
                  navigate(`/product/${product.category}/${product._id}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded"
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="max-w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <p className="text-gray-500/70">Weight: {product.weight || "N/A"}</p>
                <div className="flex items-center gap-2">
                  <label htmlFor={`qty-${product._id}`}>Qty:</label>
                  <select
                    id={`qty-${product._id}`}
                    value={product.quantity}
                    onChange={(e) => updateCartItem(product._id, Number(e.target.value))}
                    className="outline-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <p className="text-center">
              ₹{(product.price * product.quantity).toFixed(2)}
            </p>
            <button onClick={() => removeFromCart(product._id)} className="mx-auto">
              <svg width="20" height="20" fill="none" stroke="#FF532E" strokeWidth="1.5">
                <path d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0" />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="group flex items-center mt-8 gap-2 text-indigo-500 font-medium"
        >
          Continue Shopping
        </button>
      </section>

      {/* Order Summary */}
      <aside className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative mt-2">
            <div className="flex justify-between items-start">
              <p className="text-gray-500">
                {selectedAddress
                  ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                  : "No Address Found"}
              </p>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-indigo-500 hover:underline"
              >
                Change
              </button>
            </div>

            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                {address.map((addr) => (
                  <p
                    key={addr._id}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setShowAddress(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {addr.street}, {addr.city}, {addr.state}, {addr.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate("/add-address")}
                  className="text-indigo-500 text-center p-2 hover:bg-indigo-500/10 cursor-pointer"
                >
                  Add address
                </p>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="COD"
                checked={paymentType === "COD"}
                onChange={() => setPaymentType("COD")}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="ONLINE"
                checked={paymentType === "ONLINE"}
                onChange={() => setPaymentType("ONLINE")}
              />
             Pay Online (Razorpay)

            </label>
          </div>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>₹{totalCartAmount.toFixed(2)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>₹{((totalCartAmount * 2) / 100).toFixed(2)}</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>₹{totalWithTax}</span>
          </p>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full py-3 mt-6 cursor-pointer bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition"
        >
          {paymentType === "COD" ? "Place Order" : "Proceed to Pay Online"}
        </button>
      </aside>
    </main>
  );
};

export default Cart;
