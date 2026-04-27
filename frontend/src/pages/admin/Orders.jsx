import { useEffect, useState } from "react";
import API from "../../api/api";
import OrderCard from "./OrderCard";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dayFilter, setDayFilter] = useState("all");

    // ================= FETCH =================
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await API.get("/orders");
            setOrders(res.data);
            setFilteredOrders(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // ================= FILTER =================
    useEffect(() => {
        let data = [...orders];

        // 🔍 Search by customer name
        if (search) {
            data = data.filter((order) =>
                order.customer?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        // 📦 Status filter
        if (statusFilter !== "all") {
            data = data.filter((order) => order.status === statusFilter);
        }

        // 📅 Day filter
        if (dayFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            switch (dayFilter) {
                case "today":
                    data = data.filter((order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= today;
                    });
                    break;
                case "yesterday": {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    data = data.filter((order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= yesterday && orderDate < today;
                    });
                    break;
                }
                case "week": {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    data = data.filter((order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= weekAgo;
                    });
                    break;
                }
                case "month": {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    data = data.filter((order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= monthAgo;
                    });
                    break;
                }
                case "older": {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    data = data.filter((order) => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate < monthAgo;
                    });
                    break;
                }
            }
        }

        setFilteredOrders(data);
    }, [search, statusFilter, dayFilter, orders]);

    // ================= LOAD =================
    useEffect(() => {
        fetchOrders();
        // Removed automatic polling — refresh now only on user click
    }, []);

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Loading orders... 📦
            </div>
        );
    }

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Admin Orders 📦</h2>

                <div className="flex gap-3 flex-wrap">

                    {/* SEARCH */}
                    <input
                        type="text"
                        placeholder="Search by customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 rounded-lg text-sm"
                    />

                    {/* STATUS FILTER */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* DAY FILTER */}
                    <select
                        value={dayFilter}
                        onChange={(e) => setDayFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="all">All Days</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="older">Older than 1 Month</option>
                    </select>

                    {/* REFRESH */}
                    <button
                        onClick={fetchOrders}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                        Refresh 🔄
                    </button>
                </div>
            </div>

            {/* EMPTY STATE */}
            {filteredOrders.length === 0 ? (
                <div className="text-center mt-10 text-gray-500">
                    No matching orders 😢
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            refresh={fetchOrders}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}