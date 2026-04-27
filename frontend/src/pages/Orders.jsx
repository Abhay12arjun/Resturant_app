import { useEffect, useState } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openOrder, setOpenOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [notified, setNotified] = useState([]);

    // ================= FETCH =================
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await API.get("/orders/my");
            setOrders(res.data);
        } catch (err) {
            console.log(err);
            toast.error("Failed to load orders ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Removed automatic polling — refresh now only on user click
    }, []);

    // ================= DELIVERY TOAST =================
    useEffect(() => {
        orders.forEach((order) => {
            if (
                order.status === "delivered" &&
                !notified.includes(order._id)
            ) {
                toast.success(`Order #${order._id.slice(-6)} delivered 🎉`);
                setNotified((prev) => [...prev, order._id]);
            }
        });
    }, [orders]);

    // ================= STATUS COLOR =================
    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "preparing":
                return "bg-blue-100 text-blue-700";
            case "out_for_delivery":
                return "bg-purple-100 text-purple-700";
            case "delivered":
                return "bg-green-100 text-green-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    // ================= PAYMENT =================
    const getPaymentLabel = (order) => {
        if (order.isPaid || order.paymentStatus === "paid") {
            return (
                <span className="text-green-600 font-semibold">
                    Paid
                </span>
            );
        }

        if (order.paymentMethod === "COD") {
            return (
                <span className="text-orange-600 font-semibold">
                    Pay on Delivery
                </span>
            );
        }

        return (
            <span className="text-yellow-700 font-semibold">
                Payment Pending
            </span>
        );

        if (order.paymentMethod === "COD" && !order.isPaid) {
            return (
                <span className="text-orange-600 font-semibold">
                    Pay on Delivery 🚚
                </span>
            );
        }

        return (
            <span className="text-green-600 font-semibold">
                Paid ✅
            </span>
        );
    };

    // ================= PROGRESS =================
    const steps = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];

    const getProgress = (status) => steps.indexOf(status);

    // ================= CANCEL ORDER =================
    const cancelOrder = async (id) => {
        try {
            setActionLoading(id);

            await API.delete(`/orders/${id}`);

            toast.success("Order cancelled 🗑️");
            fetchOrders();

        } catch (err) {
            console.log(err);
            toast.error("Failed to cancel ❌");
        } finally {
            setActionLoading(null);
        }
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-500">
                    Loading orders... 📦
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Orders 📦</h2>

                <button
                    onClick={fetchOrders}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                    Refresh 🔄
                </button>
            </div>

            {/* EMPTY */}
            {orders.length === 0 ? (
                <div className="text-center mt-20">
                    <p className="text-gray-500 text-lg">
                        No orders yet 😢
                    </p>
                </div>
            ) : (

                <div className="space-y-6">

                    {orders.map((order) => {
                        const progress =
                            order.status === "cancelled"
                                ? steps.length - 1
                                : getProgress(order.status);

                        return (
                            <div
                                key={order._id}
                                className={`bg-white rounded-xl shadow p-5 transition
                                ${order.status === "delivered"
                                        ? "border-2 border-green-500 bg-green-50"
                                        : "hover:shadow-lg"}`}
                            >

                                {/* TOP */}
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="font-semibold">
                                            Order #{order._id.slice(-6)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.replaceAll("_", " ").toUpperCase()}
                                    </span>
                                </div>

                                {/* STATUS MESSAGES */}
                                {order.status === "delivered" && (
                                    <p className="text-green-600 font-semibold mb-2">
                                        🎉 Your order has been delivered!
                                    </p>
                                )}
                                {order.status === "cancelled" && (
                                    <p className="text-red-600 font-semibold mb-2">
                                        ❌ Order Cancelled
                                        {order.cancelledBy && (
                                            <span className="block text-xs text-gray-500 mt-1">
                                                Cancelled by: {order.cancelledBy}
                                            </span>
                                        )}
                                        {order.statusTimestamps?.cancelled && (
                                            <span className="block text-xs text-gray-500 mt-1">
                                                Cancelled at: {new Date(order.statusTimestamps.cancelled).toLocaleString()}
                                            </span>
                                        )}
                                    </p>
                                )}

                                {/* PROGRESS */}
                                <div className="flex items-center gap-2 mb-4">
                                    {steps.map((step, i) => {
                                        const ts = order.statusTimestamps?.[step];
                                        return (
                                            <div key={i} className="flex-1">
                                                <div
                                                    className={`h-2 rounded-full ${order.status === "cancelled" && step === "cancelled"
                                                        ? "bg-red-500"
                                                        : i <= progress && order.status !== "cancelled"
                                                            ? "bg-green-500"
                                                            : "bg-gray-300"
                                                        }`}
                                                />
                                                <p className="text-xs text-center mt-1 capitalize">
                                                    {step.replaceAll("_", " ")}
                                                </p>
                                                <p className="text-xs text-center text-gray-500 mt-1">
                                                    {ts ? new Date(ts).toLocaleString() : ""}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* SUMMARY */}
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">
                                        {order.items.length} items
                                    </p>

                                    <p className="font-bold text-lg">
                                        ₹{order.totalAmount}
                                    </p>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex justify-between mt-3">

                                    <button
                                        onClick={() =>
                                            setOpenOrder(openOrder === order._id ? null : order._id)
                                        }
                                        className="text-orange-500 text-sm hover:underline"
                                    >
                                        {openOrder === order._id
                                            ? "Hide Details ▲"
                                            : "View Details ▼"}
                                    </button>

                                    {/* ✅ FIXED CANCEL LOGIC */}
                                    {["pending", "preparing"].includes(order.status) && (
                                        <button
                                            onClick={() => cancelOrder(order._id)}
                                            disabled={actionLoading === order._id}
                                            className="text-red-500 text-sm hover:underline"
                                        >
                                            {actionLoading === order._id
                                                ? "Cancelling..."
                                                : "Cancel Order ❌"}
                                        </button>
                                    )}
                                </div>

                                {/* DETAILS */}
                                {openOrder === order._id && (
                                    <div className="mt-4 border-t pt-4">

                                        {/* ITEMS */}
                                        <div className="space-y-3">
                                            {order.items.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                                                >
                                                    <div className="flex gap-3 items-center">
                                                        <img
                                                            src={item.food?.image}
                                                            alt={item.name}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />

                                                        <div>
                                                            <p className="font-medium">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                ₹{item.price} × {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="font-semibold">
                                                        ₹{item.price * item.quantity}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CUSTOMER */}
                                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                                            <p>👤 {order.customer?.name}</p>
                                            <p>📞 {order.customer?.phone}</p>
                                            <p>
                                                📍 {order.customer?.address},{" "}
                                                {order.customer?.city} - {order.customer?.pincode}
                                            </p>
                                        </div>

                                        {/* PAYMENT */}
                                        <div className="mt-3 text-sm">
                                            <span className="font-medium">
                                                💳 {order.paymentMethod}
                                            </span>{" "}
                                            | {getPaymentLabel(order)}
                                        </div>

                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>
            )}
        </div>
    );
};

export default Orders;
