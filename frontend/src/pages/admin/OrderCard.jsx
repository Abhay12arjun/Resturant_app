import { useState } from "react";
import API from "../../api/api";
import OrderDetailsModal from "./OrderDetailsModal";
import toast from "react-hot-toast";

export default function OrderCard({ order, refresh }) {
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(false);

    // ================= STATUS UPDATE =================
    const updateStatus = async (status) => {
        try {
            setLoading(true);

            // 🚨 Prevent wrong flow (optional but clean UX)
            if (
                status === "delivered" &&
                order.paymentMethod === "COD" &&
                !order.isPaid
            ) {
                toast.error("Mark payment as Paid first 💰");
                return;
            }

            await API.put(`/orders/${order._id}/status`, { status });

            toast.success("Status updated ✅");
            refresh();

        } catch (err) {
            console.log(err);
            toast.error(
                err.response?.data?.message || "Failed to update status ❌"
            );
        } finally {
            setLoading(false);
        }
    };

    // ================= MARK PAID =================
    const markAsPaid = async () => {
        try {
            setLoading(true);

            await API.put(`/orders/${order._id}/payment`, {
                isPaid: true,
            });

            toast.success("Payment marked as paid 💰");
            refresh();

        } catch (err) {
            console.log(err);
            toast.error("Failed to update payment ❌");
        } finally {
            setLoading(false);
        }
    };

    // ================= DELETE =================
    const deleteOrder = async () => {
        const confirmDelete = window.confirm("Delete this order?");

        if (!confirmDelete) return;

        try {
            setLoading(true);

            await API.delete(`/orders/${order._id}`);

            toast.success("Order deleted 🗑️");
            refresh();

        } catch (err) {
            console.log(err);
            toast.error("Failed to delete ❌");
        } finally {
            setLoading(false);
        }
    };

    // ================= STATUS COLOR =================
    const getStatusColor = () => {
        switch (order.status) {
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

    // ================= DISABLE DELIVER OPTION =================
    const isDeliverDisabled =
        order.paymentMethod === "COD" && !order.isPaid;


    return (
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="font-bold text-lg">
                        {order.customer?.name || "Customer"}
                    </h3>

                    <p className="text-sm text-gray-500">
                        ₹{order.totalAmount}
                    </p>

                    <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.status === "cancelled" && (
                        <>
                            {order.cancelledBy && (
                                <p className="text-xs text-red-500 mt-1">
                                    Cancelled by: {order.cancelledBy}
                                </p>
                            )}
                            {order.statusTimestamps?.cancelled && (
                                <p className="text-xs text-red-500 mt-1">
                                    Cancelled at: {new Date(order.statusTimestamps.cancelled).toLocaleString()}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                    {order.status.replaceAll("_", " ").toUpperCase()}
                </span>
            </div>

            {/* PAYMENT */}
            <div className="mb-3 text-sm">
                <span className="font-medium">
                    💳 {order.paymentMethod}
                </span>{" "}
                |{" "}
                {order.isPaid ? (
                    <span className="text-green-600 font-semibold">Paid ✅</span>
                ) : (
                    <span className="text-orange-600 font-semibold">
                        Not Paid ❌
                    </span>
                )}
                {order.status === "cancelled" && (
                    <span className="ml-2 text-red-600 font-semibold">Order Cancelled</span>
                )}
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-2">

                {/* VIEW */}
                <button
                    onClick={() => setShowDetails(true)}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                >
                    View
                </button>

                {/* STATUS */}
                <select
                    value={order.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    disabled={loading}
                    className="border px-2 py-1 rounded"
                >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>

                    {/* 🚨 Disable delivered if not paid */}
                    <option
                        value="delivered"
                        disabled={isDeliverDisabled}
                    >
                        Delivered {isDeliverDisabled ? "(Pay First)" : ""}
                    </option>

                    <option value="cancelled">Cancelled</option>
                </select>

                {/* MARK PAID */}
                {order.paymentMethod === "COD" && !order.isPaid && (
                    <button
                        onClick={markAsPaid}
                        disabled={loading}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                        Mark Paid 💰
                    </button>
                )}

                {/* DELETE */}
                <button
                    onClick={deleteOrder}
                    disabled={loading}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                    Delete
                </button>
            </div>

            {/* LOADING */}
            {loading && (
                <p className="text-sm text-gray-500 mt-2">
                    Processing...
                </p>
            )}

            {/* MODAL */}
            {showDetails && (
                <OrderDetailsModal
                    order={order}
                    close={() => setShowDetails(false)}
                />
            )}
        </div>
    );
}