import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Users,
  ShoppingBag,
  Package,
  ClipboardList,
  DollarSign,
  TrendingUp,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSellers: 0,
    totalOrders: 0,
    totalMessages: 0,
    totalSellerRequests: 0,
    totalAdminCommission: 0,
    totalSellerPayout: 0,
  });

  const [loading, setLoading] = useState(true);
  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get(
          `${backendURL}/api/auth/admin/dashboard`,
          { withCredentials: true }
        );
        setStats(data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [backendURL]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-500 animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );

  const countsData = {
    labels: ["Users", "Products", "Sellers", "Orders", "Messages", "Requests"],
    datasets: [
      {
        data: [
          stats.totalUsers,
          stats.totalProducts,
          stats.totalSellers,
          stats.totalOrders,
          stats.totalMessages,
          stats.totalSellerRequests,
        ],
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
        ],
        borderRadius: 6,
      },
    ],
  };

  const revenueData = {
    labels: ["Admin Earnings", "Seller Earnings"],
    datasets: [
      {
        data: [
          stats.totalAdminCommission,
          stats.totalSellerPayout,
        ],
        backgroundColor: ["#4f46e5", "#059669"],
        cutout: "65%",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Real-time analytics & platform performance overview
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <ProCard title="Users" value={stats.totalUsers} icon={<Users />} />
        <ProCard title="Sellers" value={stats.totalSellers} icon={<ShoppingBag />} />
        <ProCard title="Products" value={stats.totalProducts} icon={<Package />} />
        <ProCard title="Orders" value={stats.totalOrders} icon={<ClipboardList />} />
        <ProCard title="Messages" value={stats.totalMessages} icon={<ClipboardList />} />
        <ProCard title="Requests" value={stats.totalSellerRequests} icon={<ClipboardList />} />
        <ProCard
          title="Admin Earnings"
          value={`₹ ${(stats.totalAdminCommission ?? 0).toFixed(2)}`}
          icon={<DollarSign />}
        />
        <ProCard
          title="Seller Earnings"
          value={`₹ ${(stats.totalSellerPayout ?? 0).toFixed(2)}`}
          icon={<TrendingUp />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-semibold mb-6 text-gray-700">
            Platform Overview
          </h3>
          <Bar
            data={countsData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: "#f1f5f9" },
                },
                x: {
                  grid: { display: false },
                },
              },
            }}
          />
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-semibold mb-6 text-gray-700">
            Revenue Split
          </h3>
          <Doughnut
            data={revenueData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ===========================
   PRO KPI CARD
=========================== */

const ProCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition duration-300 group">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {value}
          </h2>
        </div>
        <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl group-hover:scale-110 transition">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;