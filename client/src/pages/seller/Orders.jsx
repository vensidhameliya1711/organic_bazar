import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import api from "../../api/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderIds, setProcessingOrderIds] = useState([]);
  const [totalPaidNetPayout, setTotalPaidNetPayout] = useState(0);

  const { user } = useAppContext();

  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const adminCommissionPercent = 10;

  const statusFlow = [
    "Order Placed",
    "Approved by Seller",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const getNextStatus = (currentStatus) => {
    const index = statusFlow.indexOf(currentStatus);
    return index >= 0 && index < statusFlow.length - 1
      ? statusFlow[index + 1]
      : null;
  };

  const fetchOrders = async () => {
    if (user?.role !== "seller") {
      toast.error("Please login as seller");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get(
        `${backendURL}/api/orders/seller`,
        { withCredentials: true }
      );

      if (data.success) {
        const updatedOrders = data.orders.map((order) => {
          const sellerItems = order.items;

          const subtotal = sellerItems.reduce(
            (sum, item) =>
              !item.isCancelled
                ? sum + item.price * item.quantity
                : sum,
            0
          );

          const tax = +(subtotal * 0.02).toFixed(2);
          const totalAmount = +(subtotal + tax).toFixed(2);
          const commission =
            +(subtotal * adminCommissionPercent / 100).toFixed(2);

          return {
            ...order,
            sellerItems,
            subtotal,
            tax,
            totalAmount,
            commission,
          };
        });

        setOrders(updatedOrders);

        const totalPaid = updatedOrders.reduce((sum, order) => {
          const paidItems = order.sellerItems.filter(
            (item) => item.payout?.isPaidToSeller
          );

          const paidAmount = paidItems.reduce(
            (itemSum, item) => itemSum + (item.sellerAmount || 0),
            0
          );

          return sum + paidAmount;
        }, 0);

        setTotalPaidNetPayout(totalPaid);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "seller") fetchOrders();
  }, [user]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setProcessingOrderIds((prev) => [...prev, orderId]);

      const { data } = await api.patch(
        `${backendURL}/api/orders/update-status`,
        { orderId, newStatus },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(`Updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessingOrderIds((prev) =>
        prev.filter((id) => id !== orderId)
      );
    }
  };
const getStatusColor = (status) => {

    switch (status) {

      case "Order Placed":
        return "bg-yellow-100 text-yellow-700";

      case "Approved by Seller":
        return "bg-blue-100 text-blue-700";

      case "Packed":
        return "bg-purple-100 text-purple-700";

      case "Shipped":
        return "bg-indigo-100 text-indigo-700";

      case "Out for Delivery":
        return "bg-orange-100 text-orange-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled by User":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  if (loading)
    return <div className="text-center mt-10">Loading Orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* SUMMARY CARD */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center border">
          <p className="text-gray-500 text-sm">
            Total Earnings
          </p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹{totalPaidNetPayout.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {orders.length === 0 && (
          <p className="text-center text-gray-500">
            No orders found
          </p>
        )}

        {orders.map((order) => {
          const isProcessing =
            processingOrderIds.includes(order._id);
            const hasActiveItems = order.sellerItems.some(
          (item) => !item.isCancelled
        );

 const currentIndex = statusFlow.indexOf(order.status);
          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-md border p-6"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-lg">
                  Order ID: {order._id}
                </p>

                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                  {order.status}
                </span>
              </div>

              {/* GRID LAYOUT */}
              <div className="grid md:grid-cols-3 gap-6">

                {/* PRODUCTS */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Products
                  </h4>

                  {order.sellerItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 mb-3"
                    >
                      <img
                        src={
                          item.product?.images?.[0]
                            ? `${backendURL}/uploads/${item.product.images[0]}`
                            : `${backendURL}/uploads/default.jpg`
                        }
                        className="w-14 h-14 rounded-lg object-cover border"
                        alt=""
                      />
                      <div>
                        <p className="font-medium">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAYMENT DETAILS */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Payment Details
                  </h4>

                  <p>Total: ₹{order.totalAmount.toFixed(2)}</p>
                  <p>Tax: ₹{order.tax.toFixed(2)}</p>
                  <p>Subtotal: ₹{(order.totalAmount - order.tax).toFixed(2)}</p>
                  <p>
                    Commission ({adminCommissionPercent}%):
                    ₹{order.commission.toFixed(2)}
                  </p>
      <p>Payment Type: {order.paymentType}</p>
                  <p className="mt-2">
                    User Payment:
                    <span
                      className={`ml-2 font-medium ${
                        order.paymentStatus === "Success"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
            
                </div>
<div className="flex-1 text-sm text-gray-700">

              {order.addressId ? (
                <>
                  <p className="font-semibold">
                    {order.addressId.firstName} {order.addressId.lastName}
                  </p>

                  <p>
                    {order.addressId.street},
                    {order.addressId.city},
                    {order.addressId.state}
                    {" - "}
                    {order.addressId.pinCode}
                  </p>

                  <p>
                    {order.addressId.country}
                  </p>

                  <p>
                    📞 {order.addressId.phone}
                  </p>

                  <p>
                    Email: {order.addressId.email}
                  </p>
                </>
              ) : (
                <p className="text-red-500">
                  Address not available
                </p>
              )}

            </div>
 {/* STATUS + ACTIONS */}
            <div className="flex flex-col gap-2 min-w-[180px]">

              {/* Current Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>


              {/* PROGRESS TRACKER */}
              <div className="flex gap-2 flex-wrap">

                {statusFlow.map((step, index) => (

                  <div
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full ${
                      index <= currentIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>

                ))}

              </div>


              {/* ACTION BUTTONS */}
              {hasActiveItems && (

                order.sellerItems.map((item) => {

                  if (item.isCancelled) return null;

                  const nextStatus = getNextStatus(item.status);

                  if (!nextStatus) return null;

                  return (
                    <button
                      key={item._id}
                      onClick={() =>
                        updateStatus(order._id, nextStatus)
                      }
                      disabled={isProcessing}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as {nextStatus}
                    </button>
                  );

                })

              )}

            </div>
                {/* SELLER PAYOUT */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Seller Payout
                  </h4>

                  {order.sellerItems.map((item) => {
                    const isPaid =
                      item.payout?.isPaidToSeller;

                    return (
                      <div
                        key={item._id}
                        className="border rounded-lg p-3 mb-3 bg-gray-50"
                      >
                        <p className="text-sm font-medium">
                          {item.product?.name}
                        </p>

                        <p className="text-sm">
                          Amount: ₹
                          {item.sellerAmount?.toFixed(2)}
                        </p>

                        <p className="mt-1">
                          Status:
                          <span
                            className={`ml-2 font-medium ${
                              isPaid
                                ? "text-green-600"
                                : "text-orange-500"
                            }`}
                          >
                            {isPaid
                              ? "Paid to Seller"
                              : "Pending"}
                          </span>
                        </p>

                        {isPaid && (
                          <p className="text-xs text-gray-500 mt-1">
                            Paid On:{" "}
                            {new Date(
                              item.payout.paidAt
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STATUS BUTTON
              {order.paymentStatus === "Success" && (
                <div className="mt-4">
                  {order.sellerItems.map((item) => {
                    const nextStatus =
                      getNextStatus(item.status);

                    if (!nextStatus) return null;

                    return (
                      <button
                        key={item._id}
                        disabled={isProcessing}
                        onClick={() =>
                          updateStatus(
                            order._id,
                            nextStatus
                          )
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
                      >
                        Mark as {nextStatus}
                      </button>
                    );
                  })}
                </div>
              )} */}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
