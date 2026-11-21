import api from "../../api/api";
import { useEffect, useState } from "react";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import toast from "react-hot-toast";

import {
  Package,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";

/* ================= CHART REGISTRATION ================= */

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

export default function SellerDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalinStock: 0,
    totalOutofStock: 0,
    totalDeleted: 0,
   
  });

  


  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const res = await api.get(
          "http://localhost:5000/api/products/seller/dashboard",
          { withCredentials: true }
        );

        if (res.data.success) {
          setProducts(res.data.products || []);
          setOrders(res.data.orders || []);
          // setExpiringProducts(res.data.expiringProducts || []);
          setStats(res.data.stats || {});
        } else {
          toast.error("Failed to fetch seller data");
        }
      } catch (err) {
        toast.error("Failed to fetch seller data");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-gray-500 text-lg">
          Loading dashboard...
        </div>
      </div>
    );
  }

  /* ================= SUMMARY DATA ================= */

  const totalOrders = orders.length;

  const shippedOrders = orders.filter(order =>
    order.items?.some(item => item.status === "Shipped")
  ).length;

  const pakedOrders = orders.filter(order =>
    order.items?.some(item => item.status === "Packed")
  ).length; 
  const outfordeliveryOrders = orders.filter(order =>
    order.items?.some(item => item.status === "Out for Delivery")
  ).length; 
  const deliveredOrders = orders.filter(order =>
    order.items?.some(item => item.status === "Delivered")
  ).length;

  const approvedOrders = orders.filter(order =>
    order.items?.some(item => item.status === "Approved by Seller")
  ).length;

  const pendingOrders = orders.filter(order =>
    order.items?.some(item => item.status === "Order Placed")
  ).length;

  const cancelledOrders = orders.filter(order =>
    order.items?.some(item => item.status === "Cancelled by User")
  ).length;

  const todayDate = new Date().toISOString().slice(0, 10);

  const todaysCancelledOrders = orders.reduce((count, order) => {
    const cancelledToday =
      order.items?.filter(
        item =>
          item.status === "Cancelled by User" &&
          new Date(item.createdAt).toISOString().slice(0, 10) === todayDate
      ) || [];

    return count + cancelledToday.length;
  }, 0);

  /* ================= CHART DATA ================= */

  const orderStatusData = {
    labels: ["Pending","Approved", "Packed","Shipped",   "Out for Delivery", "Delivered", "Cancelled"],
    datasets: [
      {
        data: [
          shippedOrders,
          deliveredOrders,
          approvedOrders,
          pakedOrders,
          outfordeliveryOrders,
          pendingOrders,
          cancelledOrders,
        ],
        backgroundColor: [
          "#f59e0b",
          "#22c55e",
          "#3b82f6",
          "#a855f7",
          "#341f61",
          "#facc15",
          "#ef4444",
        ],
      },
    ],
  };

  // const months = Array.from({ length: 12 }, (_, i) =>
  //   new Date(0, i).toLocaleString("default", { month: "short" })
  // );

  // const monthlySales = months.map((_, index) =>
  //   orders.reduce((sum, order) => {
  //     const revenue =
  //       order.items?.reduce((itemSum, item) => {
  //         if (
  //           item.status !== "Cancelled by User" &&
  //           new Date(item.createdAt).getMonth() === index
  //         ) {
  //           return (
  //             itemSum +
  //             (item.product?.offerPrice || 0) * item.quantity
  //           );
  //         }
  //         return itemSum;
  //       }, 0) || 0;

  //     return sum + revenue;
  //   }, 0)
  // );
 // ✅ months first
  // Step 1: months array
/* ================= CHART DATA ================= */

// ✅ months array
const months = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "short" })
);

// ✅ Monthly Net Payout calculation (CORRECT)
const monthlyNetPayout = months.map((_, monthIndex) =>
  orders.reduce((monthSum, order) => {

    // only include paid orders
    if (!order.isPaid) return monthSum;

    // sum sellerAmount of all items in that month
    const orderMonthPayout =
      order.items?.reduce((itemSum, item) => {

        const itemDate = new Date(item.createdAt);
        const itemMonth = itemDate.getMonth();

        if (itemMonth === monthIndex) {
          return itemSum + (item.sellerAmount || 0);
        }

        return itemSum;

      }, 0) || 0;

    return monthSum + orderMonthPayout;

  }, 0)
);

// ✅ Line chart data
const lineData = {
  labels: months,
  datasets: [
    {
      label: "Net Payout (Paid Orders)",
      data: monthlyNetPayout,
      fill: true,
      backgroundColor: "rgba(59,130,246,0.15)",
      borderColor: "#3b82f6",
      borderWidth: 2,
      tension: 0.4,
    },
  ],
};

  // const lineData = {
  //   labels: months,
  //   datasets: [
  //     {
  //       label: "Revenue",
  //       data: monthlySales,
  //       fill: true,
  //       backgroundColor: "rgba(16,185,129,0.15)",
  //       borderColor: "#10b981",
  //       tension: 0.4,
  //     },
  //   ],
  // };

const categories = [
  ...new Set(
    products.map(p =>
      typeof p.category === "object"
        ? p.category?.name
        : p.category
    )
  ),
];

const categoryCounts = categories.map(cat =>
  products.filter(p =>
    (typeof p.category === "object"
      ? p.category?.name
      : p.category) === cat
  ).length
);

const barData = {
  labels: categories,
  datasets: [
    {
      label: "Products",
      data: categoryCounts,
      backgroundColor: "#0ea5e9",
    },
  ],
};

  /* ================= UI ================= */

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-emerald-50 to-cyan-50 space-y-8">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Seller Dashboard
          </h1>

          <p className="text-gray-500 text-sm">
            Monitor your store performance and product expiry
          </p>

        </div>

      </div>

      {/* SUMMARY CARDS */}

      {/* ===== ORDER STATS ===== */}

<div className="space-y-3">

  <h2 className="text-lg font-semibold text-gray-700">
    Order Overview
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

    <SummaryCard title="Total Orders" value={totalOrders} variant="indigo" />
    <SummaryCard title="Order Place" value={pendingOrders} variant="green" />
     <SummaryCard title="Approved Orders" value={approvedOrders} variant="blue" />
    <SummaryCard title="Shipped Orders" value={shippedOrders} variant="yellow" />
    <SummaryCard title="Packed Orders" value={pakedOrders} variant="emerald" />
    <SummaryCard title="Out for Delivery" value={outfordeliveryOrders} variant="indigo" />  
    <SummaryCard title="Delivered Orders" value={deliveredOrders} variant="emerald" />
  <SummaryCard title="Today's Cancelled" value={todaysCancelledOrders} variant="rose" />

  </div>

</div>


{/* ===== PRODUCT STATS ===== */}

<div className="space-y-3">

  <h2 className="text-lg font-semibold text-gray-700">
    Product Overview
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

    <SummaryCard title="Total Products" value={stats.totalProducts} variant="green" />
    <SummaryCard title="In Stock" value={stats.totalinStock} variant="indigo" />
    <SummaryCard title="Out of Stock" value={stats.totalOutofStock} variant="rose" />
    <SummaryCard title="Deleted Products" value={stats.totalDeleted} variant="yellow" />
    

  </div>

</div>


        

      {/* EXPIRING ALERT */}

      {/* <div className="bg-white rounded-2xl shadow-lg border border-red-100">

        <div className="p-5 border-b bg-red-50 rounded-t-2xl">

          <h3 className="text-lg font-bold text-red-600">
            ⚠ Expiring Products Alert
          </h3>

        </div>

        <div className="p-5">

          {expiringProducts.length === 0 ? (

            <div className="text-gray-500 text-center py-6">
              No expiring products
            </div>

          ) : (

            <table className="w-full table-fixed border-collapse">

  {/* HEADER */}
  

      {/* CHARTS */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        <ChartBox title="Order Status">
          <Pie data={orderStatusData} />
        </ChartBox>

        <ChartBox title="Revenue Overview">
          <Line data={lineData} />
        </ChartBox>

        <ChartBox title="Product Categories">
          <Bar data={barData} />
        </ChartBox>

      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

const SummaryCard = ({ title, value, variant }) => {

  const styles = {

    indigo: {
      bg: "from-indigo-500 to-indigo-600",
      icon: <ShoppingCart size={20} />,
    },

    green: {
      bg: "from-green-500 to-emerald-600",
      icon: <Package size={20} />,
    },

    emerald: {
      bg: "from-emerald-500 to-teal-600",
      icon: <CheckCircle size={20} />,
    },

    yellow: {
      bg: "from-yellow-500 to-orange-500",
      icon: <AlertTriangle size={20} />,
    },

    rose: {
      bg: "from-red-500 to-rose-600",
      icon: <XCircle size={20} />,
    },

    blue: {
      bg: "from-blue-500 to-cyan-600",
      icon: <Clock size={20} />,
    },

  };

  return (

    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 transition">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-2xl font-bold text-gray-800">
            {value}
          </h2>

        </div>

        <div className={`bg-gradient-to-r ${styles[variant].bg}
        text-white p-3 rounded-xl`}>

          {styles[variant].icon}

        </div>

      </div>

    </div>

  );

};

const ChartBox = ({ title, children }) => (

  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 transition">

    <h3 className="font-semibold text-gray-700 mb-4">
      {title}
    </h3>

    {children}

  </div>

);
