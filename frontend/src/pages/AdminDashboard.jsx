import { useState, useEffect } from "react";
import API from "../api/api";

import Dashboard from "./admin/Dashboard";
import Food from "./admin/Food";
import Orders from "./admin/Orders";
import Customers from "./admin/Customers";
import Payments from "./admin/Payments"; // ✅ Import Payments
import Delivery from "./admin/Delivery";
import Notifications from "./admin/Notifications";
import Profile from "./admin/Profile";
import Reports from "./admin/Reports";

export default function AdminDashboard() {
    const [tab, setTab] = useState("dashboard");
    const [customerCount, setCustomerCount] = useState(0);

    // 🔄 Fetch customers count from orders
    const fetchCustomers = async () => {
        try {
            const res = await API.get("/orders");

            const uniqueCustomers = new Set(
                res.data.map((order) => order.customerName)
            );

            setCustomerCount(uniqueCustomers.size);
        } catch (err) {
            console.error("Customer fetch error:", err);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <div className="flex min-h-screen">

            {/* ================= SIDEBAR ================= */}
            <div className="w-64 bg-gray-900 text-white p-5 space-y-3">

                <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

                {/* Dashboard */}
                <button
                    onClick={() => setTab("dashboard")}
                    className={`w-full text-left px-3 py-2 rounded ${tab === "dashboard" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    📊 Dashboard
                </button>

                {/* Food */}
                <button
                    onClick={() => setTab("food")}
                    className={`w-full text-left px-3 py-2 rounded ${tab === "food" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    🍔 Food Management
                </button>

                {/* Orders */}
                <button
                    onClick={() => setTab("orders")}
                    className={`w-full text-left px-3 py-2 rounded ${tab === "orders" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    📦 Orders
                </button>


                <button
                    onClick={() => setTab("delivery")}
                    className={`w-full text-left px-3 py-2 rounded ${tab === "delivery" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    📍 Delivery
                </button>

                {/* Customers */}
                <button
                    onClick={() => setTab("customers")}
                    className={`w-full text-left px-3 py-2 rounded flex justify-between ${tab === "customers" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    <span>👥 Customers</span>
                    <span className="bg-gray-700 px-2 rounded">
                        {customerCount}
                    </span>
                </button>
                <button
                    onClick={() => setTab("reports")}
                    className={`w-full text-left px-3 py-2 rounded ${tab === "reports" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    📝 Reports
                </button>

                {/* Payments */}
                <button
                    onClick={() => setTab("payments")}
                    className={`w-full text-left px-3 py-2 rounded ${tab === "payments" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    💰 Payments
                </button>

                {/* Others */}







                <button
                    onClick={() => setTab("profile")}
                    className={`w-full text-left px-3 py-2 rounded ${tab === "profile" ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                >
                    ⚙️ Profile
                </button>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="flex-1 p-6 bg-gray-100">
                <div className="flex justify-end mb-4">
                    <Notifications />
                </div>
                {tab === "dashboard" && <Dashboard />}
                {tab === "food" && <Food />}
                {tab === "orders" && <Orders />}
                {tab === "customers" && <Customers />}

                {/* ✅ THIS WAS MISSING */}
                {tab === "payments" && <Payments />}
                {tab === "delivery" && <Delivery />}
                {tab === "reports" && <Reports />}
                {tab === "profile" && <Profile />}

            </div>
        </div>
    );
}