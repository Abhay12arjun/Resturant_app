import { useEffect, useState } from "react";
import API from "../../api/api";

export default function Payments() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");

    const fetchPayments = async () => {
        try {
            const res = await API.get("/orders");
            setOrders(res.data);
        } catch (err) {
            console.error("Payment fetch error:", err);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // 🔍 Filter logic
    const filteredOrders = orders.filter((order) => {
        if (filter === "paid") return order.isPaid === true;
        if (filter === "unpaid") return order.isPaid === false;
        if (filter === "day" && selectedDate) {
            // Assuming order.createdAt is ISO string
            const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
            return orderDate === selectedDate;
        }
        return true;
    });

    // 💰 Total earnings
    const totalEarnings = filteredOrders
        .filter((o) => o.isPaid)
        .reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">💰 Payment Management</h2>

            {/* Filters */}
            <div className="flex gap-3 mb-4 items-center flex-wrap">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded ${filter === "all" ? "bg-black text-white" : "bg-gray-200"}`}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("paid")}
                    className={`px-3 py-1 rounded ${filter === "paid" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                >
                    Paid
                </button>

                <button
                    onClick={() => setFilter("unpaid")}
                    className={`px-3 py-1 rounded ${filter === "unpaid" ? "bg-red-600 text-white" : "bg-gray-200"}`}
                >
                    Unpaid
                </button>

                {/* Day filter */}
                <input
                    type="date"
                    value={selectedDate}
                    onChange={e => {
                        const val = e.target.value;
                        setSelectedDate(val);
                        setFilter(val ? "day" : "all");
                    }}
                    className="px-2 py-1 border rounded"
                />
            </div>

            {/* Earnings */}
            <div className="bg-white p-4 shadow mb-4 rounded">
                <h3 className="text-lg font-semibold">
                    Total Earnings: ₹{totalEarnings}
                </h3>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {filteredOrders.map((order) => (
                    <div
                        key={order._id}
                        className="bg-white p-4 shadow rounded"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="font-bold">{order.customer?.name || order.customerName}</h3>
                                <p>₹{order.totalAmount}</p>
                                <p className="text-sm text-gray-500">
                                    Payment Method: {order.paymentMethod === "ONLINE" ? "Online" : "Cash on Delivery"}
                                </p>
                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                {order.isPaid ? (
                                    <span className="text-green-600 font-bold">
                                        Paid ✅
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-bold">
                                        Unpaid ❌
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="ml-2">
                            <span className="font-semibold">Foods:</span>
                            <ul className="list-disc ml-5">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, idx) => (
                                        <li key={idx} className="text-sm">
                                            {item.name} x{item.quantity} (₹{item.price})
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-gray-400">No items</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}