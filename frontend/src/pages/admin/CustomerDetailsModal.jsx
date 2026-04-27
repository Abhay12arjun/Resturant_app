import { useEffect, useState } from "react";
import API from "../../api/api";
import toast from "react-hot-toast";
import OrderDetailsModal from "./OrderDetailsModal";

export default function CustomerDetailsModal({ customer, customerId, close }) {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const name = customer?.name || "Unknown";
    const email = customer?.email || "No Email";
    const phone = customer?.phone || "N/A";

    // ================= FETCH =================
    const fetchOrders = async () => {
        if (!customerId) return;

        try {
            setLoading(true);

            const res = await API.get(`/orders?userId=${customerId}`);
            setOrders(res.data || []);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load orders ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setOrders([]);
        fetchOrders();
    }, [customerId]);

    // ================= CALCULATIONS =================
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
    );

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

                <div className="bg-white p-6 w-[420px] rounded-xl">

                    <button onClick={close} className="absolute top-2 right-3">✖</button>

                    <h2 className="text-xl font-bold mb-4">Customer Details 👤</h2>

                    <div className="text-sm mb-4">
                        <p><b>Name:</b> {name}</p>
                        <p><b>Email:</b> {email}</p>
                        <p><b>Phone:</b> {phone}</p>
                    </div>

                    <div className="flex justify-between mb-4 bg-gray-50 p-2 rounded">
                        <p>📦 Orders: {totalOrders}</p>
                        <p className="text-green-600">₹{totalSpent}</p>
                    </div>

                    <h3 className="mb-2">Order History 📦</h3>

                    {loading ? (
                        <p>Loading...</p>
                    ) : orders.length === 0 ? (
                        <p>No orders found</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {orders.map((order) => (
                                <div key={order._id} className="border p-2 flex justify-between">

                                    <div>
                                        <p>₹{order.totalAmount}</p>
                                        <p className="text-xs">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                    >
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={close}
                        className="mt-4 w-full bg-gray-600 text-white py-2 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* ORDER MODAL */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    close={() => setSelectedOrder(null)}
                />
            )}
        </>
    );
}