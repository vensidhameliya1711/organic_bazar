import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const MyOrders = () => {

  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancelingItems, setCancelingItems] = useState({});
  const [processingPayment, setProcessingPayment] = useState({});

  const { user, loadingUser } = useAppContext();

  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";


  // ===============================
  // Helpers
  // ===============================

  const getProductImage = (product) => {
    if (!product?.images?.length)
      return `${backendURL}/uploads/default.jpg`;

    const img = product.images[0];

    return img.startsWith("http")
      ? img
      : `${backendURL}/uploads/${img}`;
  };


  const calculateOrderTotal = (order) => {
    const subtotal = order.items.reduce(
      (sum, item) =>
        !item.isCancelled
          ? sum + item.price * item.quantity
          : sum,
      0
    );

    return subtotal + subtotal * 0.02;
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed":
        return "bg-yellow-100 text-yellow-700";
      case "Approved by Seller":
        return "bg-blue-100 text-blue-700";
      case "Packed":
        return "bg-indigo-100 text-indigo-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Out for Delivery":
        return "bg-orange-100 text-orange-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled by User":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  const orderSteps = [
    "Order Placed",
    "Approved by Seller",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];


  const getStepIndex = (status) => {
    return orderSteps.indexOf(status);
  };


  const canCancel = (item) => {
    return (
      !item.isCancelled &&
      !["Shipped", "Out for Delivery", "Delivered"].includes(item.status)
    );
  };


  // ===============================
  // Fetch Orders
  // ===============================

  useEffect(() => {

    const fetchOrders = async () => {

      if (!user?._id) return;

      try {

        setLoadingOrders(true);

        const { data } =
          await axios.get(
            `${backendURL}/api/orders/user`,
            { withCredentials: true }
          );

        if (data.success)
          setMyOrders(data.orders || []);

      } catch {
        toast.error("Failed to fetch orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    if (!loadingUser)
      fetchOrders();

  }, [user, loadingUser]);


  // ===============================
  // Cancel Order
  // ===============================

  const cancelOrderHandler =
    async (orderId, itemId) => {

      setCancelingItems(prev => ({
        ...prev,
        [itemId]: true
      }));

      try {

        const { data } =
          await axios.patch(
            `${backendURL}/api/orders/cancel/item/${orderId}/${itemId}`,
            {},
            { withCredentials: true }
          );

        if (data.success) {

          toast.success("Item Cancelled");

          setMyOrders(prev =>
            prev.map(order =>
              order._id === orderId
                ? {
                    ...order,
                    items: order.items.map(item =>
                      item._id === itemId
                        ? {
                            ...item,
                            status: "Cancelled by User",
                            isCancelled: true
                          }
                        : item
                    )
                  }
                : order
            )
          );
        }

      } catch {
        toast.error("Cancel failed");
      } finally {
        setCancelingItems(prev => ({
          ...prev,
          [itemId]: false
        }));
      }
    };


  // ===============================
  // Payment
  // ===============================

  const handlePayment = async (orderId) => {

    try {

      setProcessingPayment(prev => ({
        ...prev,
        [orderId]: true
      }));

      const { data } =
        await axios.post(
          `${backendURL}/api/orders/create-order`,
          { orderId },
          { withCredentials: true }
        );

      if (!data.success)
        return toast.error("Payment failed");

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Organic Bazar",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response) {

          const verify =
            await axios.post(
              `${backendURL}/api/orders/verify-payment`,
              {
                orderId,
                ...response,
              },
              { withCredentials: true }
            );

          if (verify.data.success) {
            toast.success("Payment Successful");

            const refreshed =
              await axios.get(
                `${backendURL}/api/orders/user`,
                { withCredentials: true }
              );

            setMyOrders(refreshed.data.orders);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#16a34a" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch {
      toast.error("Payment error");
    } finally {
      setProcessingPayment(prev => ({
        ...prev,
        [orderId]: false
      }));
    }
  };


  // ===============================
  // Loading
  // ===============================

  if (loadingUser || loadingOrders)
    return <p className="text-center mt-10">Loading Orders...</p>;


  // ===============================
  // UI
  // ===============================

 return (

  <main className="max-w-7xl mx-auto px-4 py-10">

    <h1 className="text-3xl font-bold mb-8 text-gray-800">
      My Orders
    </h1>

    {myOrders.length === 0 && (
      <div className="bg-white p-10 rounded-xl shadow text-center">
        No orders found
      </div>
    )}

    {myOrders.map(order => (

      <div
        key={order._id}
        className="bg-white border rounded-xl shadow-sm mb-8 overflow-hidden hover:shadow-md transition"
      >

        {/* ORDER HEADER */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-semibold">{order._id}</p>
            </div>

            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Payment</p>
              <p className="font-semibold">
                {order.paymentType}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                order.paymentStatus === "Success"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {order.paymentStatus}
              </p>
            </div>

          </div>

          <div className="text-lg font-bold text-gray-800">
            ₹{calculateOrderTotal(order).toFixed(2)}
          </div>

        </div>


        {/* ITEMS */}
        {order.items.map(item => {

          const product = item.product || {};
          const currentStep = getStepIndex(item.status);

          return (

            <div
              key={item._id}
              className="px-6 py-6 border-t hover:bg-gray-50 transition"
            >

              <div className="flex flex-col md:flex-row gap-6">

                {/* IMAGE */}
                <img
                  src={getProductImage(product)}
                  className="w-28 h-28 object-cover rounded-lg border"
                />


                {/* DETAILS */}
                <div className="flex-1">

                  <h2 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h2>

                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>Qty: {item.quantity}</span>
                    <span>Price: ₹{item.price}</span>
                    <span>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>


                  {/* PROGRESS BAR */}
                  {item.status !== "Cancelled by User" && (

                    <div className="mt-6">

                      <div className="flex justify-between text-xs text-gray-500 mb-2">

                        {orderSteps.map((step, index) => {

                          const completed = index <= currentStep;

                          return (
                            <span
                              key={step}
                              className={completed ? "text-green-600 font-medium" : ""}
                            >
                              {step}
                            </span>
                          );

                        })}

                      </div>

                      <div className="w-full bg-gray-200 h-2 rounded-full">

                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width:
                              currentStep >= 0
                                ? `${(currentStep / (orderSteps.length - 1)) * 100}%`
                                : "0%"
                          }}
                        />

                      </div>

                    </div>

                  )}

                </div>


                {/* ACTIONS */}
                <div className="flex flex-col gap-3 min-w-[140px]">

                  {canCancel(item) &&
                    !(order.paymentType === "ONLINE" &&
                      order.paymentStatus === "Success") && (

                      <button
                        onClick={() =>
                          cancelOrderHandler(order._id, item._id)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
                      >
                        {cancelingItems[item._id]
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>

                  )}

                  {order.paymentType === "ONLINE"
                    && order.paymentStatus !== "Success" && (

                      <button
                        onClick={() =>
                          handlePayment(order._id)
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                      >
                        {processingPayment[order._id]
                          ? "Processing..."
                          : "Pay Now"}
                      </button>

                  )}

                </div>

              </div>

            </div>

          );

        })}

      </div>

    ))}

  </main>

);

};

export default MyOrders;
