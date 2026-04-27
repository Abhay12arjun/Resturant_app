import { useEffect, useState } from "react";
import API from "../../api/api";
import CustomerCard from "./CustomerCard";
import toast from "react-hot-toast";

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI states
    const [search, setSearch] = useState("");
    const [minOrders, setMinOrders] = useState(0);
    const [sortBy, setSortBy] = useState("recent");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    // ================= FETCH CUSTOMERS FROM ORDERS =================
    const fetchCustomers = async () => {
        try {
            setLoading(true);

            const res = await API.get("/orders");

            const orders = res.data?.orders || res.data?.data || res.data || [];

            // 🔥 EXTRACT UNIQUE CUSTOMERS (prefer registered user id)
            const uniqueCustomersMap = {};

            orders.forEach((order) => {
                const c = order.customer || {};
                const user = order.user || null; // populated in backend

                const key = (user && user._id) || c.phone || user?.email || order._id;

                const name = c.name || user?.name || "Guest";
                const email = user?.email || c.email || "";
                const phone = c.phone || "";
                const address = c.address || "";
                const city = c.city || "";
                const pincode = c.pincode || "";
                const lastOrderAt = order.createdAt;

                if (!uniqueCustomersMap[key]) {
                    uniqueCustomersMap[key] = {
                        name,
                        email,
                        phone,
                        address,
                        city,
                        pincode,
                        ordersCount: 1,
                        totalSpent: order.totalAmount || 0,
                        userId: user?._id || null,
                        lastOrderAt,
                    };
                } else {
                    uniqueCustomersMap[key].ordersCount += 1;
                    uniqueCustomersMap[key].totalSpent += order.totalAmount || 0;
                    // update lastOrderAt to most recent
                    if (new Date(order.createdAt) > new Date(uniqueCustomersMap[key].lastOrderAt)) {
                        uniqueCustomersMap[key].lastOrderAt = order.createdAt;
                    }
                    if (!uniqueCustomersMap[key].userId && user?._id) {
                        uniqueCustomersMap[key].userId = user._id;
                    }
                    if (!uniqueCustomersMap[key].email && user?.email) {
                        uniqueCustomersMap[key].email = user.email;
                    }
                }
            });

            const finalCustomers = Object.values(uniqueCustomersMap).sort((a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt));

            setCustomers(finalCustomers);

        } catch (err) {
            console.error("Customer fetch error:", err);
            toast.error("Failed to load customers ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <p className="text-gray-500 text-lg">
                    Loading customers... 👥
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    Customers 👥
                </h2>

                <button
                    onClick={fetchCustomers}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                    Refresh 🔄
                </button>
            </div>

            {/* EMPTY */}
            {customers.length === 0 ? (
                <div className="text-center mt-20">
                    <p className="text-gray-500 text-lg">
                        No customers found 😢
                    </p>
                </div>
            ) : (

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {customers.map((customer, index) => (
                        <CustomerCard
                            key={index}
                            customer={customer}
                        />
                    ))}
                </div>

            )}
        </div>
    );
}