import { useEffect, useState } from "react";
import API from "../../api/api";

export default function Dashboard() {
    const [foods, setFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const foodRes = await API.get("/food");
                const orderRes = await API.get("/orders");

                setFoods(foodRes.data);
                setOrders(orderRes.data);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate revenue safely
    const revenue = orders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
    );

    if (loading) {
        return (
            <div className="pt-24 text-center text-gray-500">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="pt-24 px-6 min-h-screen bg-gray-50">

            {/* Title */}
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Admin Dashboard 📊
            </h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Foods */}
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <p className="text-gray-500">Total Foods</p>
                    <h2 className="text-2xl font-bold text-indigo-600">
                        {foods.length}
                    </h2>
                </div>

                {/* Orders */}
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <p className="text-gray-500">Total Orders</p>
                    <h2 className="text-2xl font-bold text-blue-600">
                        {orders.length}
                    </h2>
                </div>

                {/* Revenue */}
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <p className="text-gray-500">Total Revenue</p>
                    <h2 className="text-2xl font-bold text-green-600">
                        ₹{revenue}
                    </h2>
                </div>
            </div>

            {/* Optional: Recent Orders Preview */}
            <div className="mt-10 bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4">
                    Recent Orders
                </h2>

                {orders.length === 0 ? (
                    <p className="text-gray-500">No orders yet</p>
                ) : (
                    <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                            <div
                                key={order._id}
                                className="flex justify-between border-b pb-2"
                            >
                                <span className="text-gray-700">
                                    Order #{order._id.slice(-5)}
                                </span>
                                <span className="text-gray-600">
                                    ₹{order.totalAmount}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}