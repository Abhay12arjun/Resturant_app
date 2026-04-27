import { useEffect, useState } from "react";
import API from "../../api/api";

export default function Reports() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");

    // ================= FETCH =================
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await API.get("/orders");
            setOrders(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ================= FILTER LOGIC =================
    const filteredOrders = orders.filter((o) => {
        if (filter === "all") return true;

        const date = new Date(o.createdAt);
        const now = new Date();

        if (filter === "today") {
            return date.toDateString() === now.toDateString();
        }

        if (filter === "week") {
            const diff = (now - date) / (1000 * 60 * 60 * 24);
            return diff <= 7;
        }

        if (filter === "month") {
            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        }

        return true;
    });

    // ================= CALCULATIONS =================
    const totalOrders = filteredOrders.length;

    const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
    );

    const delivered = filteredOrders.filter(o => o.status === "delivered").length;
    const pending = filteredOrders.filter(o => o.status === "pending").length;
    const cancelled = filteredOrders.filter(o => o.status === "cancelled").length;

    const cod = filteredOrders.filter(o => o.paymentMethod === "COD").length;
    const online = filteredOrders.filter(o => o.paymentMethod === "ONLINE").length;

    // ================= TOP CUSTOMERS =================
    const customerMap = {};
    filteredOrders.forEach(o => {
        const name = o.customer?.name || "Guest";
        customerMap[name] = (customerMap[name] || 0) + o.totalAmount;
    });

    const topCustomers = Object.entries(customerMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // ================= UI =================
    return (
        <div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Reports & Analytics 📊
                </h1>

                {/* FILTER */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border px-3 py-1 rounded"
                >
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {/* ================= CARDS ================= */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">

                        <Card title="Orders" value={totalOrders} color="blue" icon="📦" />
                        <Card title="Revenue" value={`₹${totalRevenue}`} color="green" icon="💰" />
                        <Card title="Delivered" value={delivered} color="green" icon="✅" />
                        <Card title="Pending" value={pending} color="yellow" icon="⏳" />

                    </div>

                    {/* ================= STATUS ================= */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">

                        <Card title="Cancelled" value={cancelled} color="red" icon="❌" />
                        <Card title="COD Orders" value={cod} color="purple" icon="💵" />
                        <Card title="Online Orders" value={online} color="indigo" icon="💳" />

                    </div>

                    {/* ================= TOP CUSTOMERS ================= */}
                    <div className="bg-white p-4 rounded shadow mb-6">
                        <h2 className="font-semibold mb-3">
                            Top Customers 🏆
                        </h2>

                        {topCustomers.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No data
                            </p>
                        ) : (
                            topCustomers.map(([name, amount], i) => (
                                <div key={i} className="flex justify-between border-b py-1 text-sm">
                                    <span>{name}</span>
                                    <span className="font-medium">₹{amount}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ================= RECENT ORDERS ================= */}
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-semibold mb-3">
                            Recent Orders 📜
                        </h2>

                        <div className="max-h-60 overflow-y-auto text-sm space-y-2">
                            {filteredOrders.slice(0, 5).map((o) => (
                                <div key={o._id} className="flex justify-between border-b pb-1">
                                    <span>{o.customer?.name || "User"}</span>
                                    <span>₹{o.totalAmount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


// ================= REUSABLE CARD =================
function Card({ title, value, color, icon }) {

    const colors = {
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-yellow-700",
        red: "bg-red-100 text-red-700",
        purple: "bg-purple-100 text-purple-700",
        indigo: "bg-indigo-100 text-indigo-700",
    };

    return (
        <div className={`p-4 rounded shadow ${colors[color]} flex justify-between items-center`}>
            <div>
                <p className="text-sm">{title}</p>
                <h2 className="text-xl font-bold">{value}</h2>
            </div>
            <span className="text-2xl">{icon}</span>
        </div>
    );
}