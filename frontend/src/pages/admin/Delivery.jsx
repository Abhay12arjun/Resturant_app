import { useEffect, useState } from "react";
import API from "../../api/api";
import toast from "react-hot-toast";

export default function Delivery() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // ================= FETCH =================
    const fetchOrders = async () => {
        try {
            setLoading(true);

            const res = await API.get("/orders");

            // ✅ Show only delivery related orders
            const filtered = res.data.filter(
                (order) =>
                    order.status === "out_for_delivery" ||
                    order.status === "delivered"
            );

            setOrders(filtered);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load delivery orders ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // 🔥 Auto refresh every 10 sec
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    // ================= UPDATE STATUS =================
    const updateStatus = async (id, status) => {
        try {
            setActionLoading(id);

            await API.put(`/orders/${id}/status`, { status });

            toast.success("Status updated 🚚");
            fetchOrders();

        } catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message || "Failed to update ❌"
            );
        } finally {
            setActionLoading(null);
        }
    };

    // ================= STATUS COLOR =================
    const getStatusColor = (status) => {
        switch (status) {
            case "out_for_delivery":
                return "bg-purple-100 text-purple-700";
            case "delivered":
                return "bg-green-100 text-green-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading delivery orders... 🚚</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    🚚 Delivery Management
                </h2>

                <button
                    onClick={fetchOrders}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                    Refresh 🔄
                </button>
            </div>

            {/* EMPTY */}
            {orders.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                    No delivery orders 🚫
                </p>
            ) : (
                <div className="space-y-4">

                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
                        >

                            {/* TOP */}
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {order.customer?.name}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        📞 {order.customer?.phone}
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                                >
                                    {order.status.replaceAll("_", " ")}
                                </span>
                            </div>

                            {/* ADDRESS */}
                            <div className="text-sm text-gray-600 mb-3">
                                📍 {order.customer?.address},{" "}
                                {order.customer?.city} -{" "}
                                {order.customer?.pincode}
                            </div>

                            {/* ITEMS COUNT */}
                            <p className="text-sm text-gray-500 mb-2">
                                {order.items.length} items
                            </p>

                            {/* ACTIONS */}
                            <div className="flex justify-between items-center">

                                {/* STATUS */}
                                <select
                                    value={order.status}
                                    onChange={(e) =>
                                        updateStatus(order._id, e.target.value)
                                    }
                                    disabled={
                                        actionLoading === order._id ||
                                        order.status === "delivered"
                                    }
                                    className="border px-3 py-1 rounded"
                                >
                                    <option value="out_for_delivery">
                                        Out for Delivery
                                    </option>
                                    <option value="delivered">
                                        Delivered
                                    </option>
                                </select>

                                {/* TOTAL */}
                                <span className="font-semibold">
                                    ₹{order.totalAmount}
                                </span>
                            </div>

                            {/* LOADING */}
                            {actionLoading === order._id && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Updating...
                                </p>
                            )}
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}