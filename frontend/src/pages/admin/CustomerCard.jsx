import { useState } from "react";
import API from "../../api/api";
import CustomerDetailsModal from "./CustomerDetailsModal";
import toast from "react-hot-toast";

export default function CustomerCard({ customer, refresh }) {

    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ IMPORTANT: use userId if exists
    const customerId = customer?.userId || customer?._id;

    const name = customer?.name || "Unknown";
    const email = customer?.email || "No Email";
    const phone = customer?.phone || "No Phone";
    const address = customer?.address || "No Address";
    const isBlocked = customer?.isBlocked ?? false;

    const ordersCount = customer?.ordersCount ?? 0;
    const totalSpent = customer?.totalSpent ?? 0;

    // ================= BLOCK =================
    const toggleBlock = async () => {
        if (!customerId) return toast.error("Invalid customer ❌");

        try {
            setLoading(true);

            await API.put(`/admin/customers/${customerId}/block`);

            toast.success(
                isBlocked ? "Customer unblocked ✅" : "Customer blocked 🚫"
            );

            refresh?.();

        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed ❌");
        } finally {
            setLoading(false);
        }
    };

    // ================= DELETE =================
    const deleteCustomer = async () => {
        if (!customerId) return toast.error("Invalid customer ❌");

        const confirmDelete = window.confirm(
            `Delete ${name}? This cannot be undone.`
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);

            await API.delete(`/admin/customers/${customerId}`);

            toast.success("Customer deleted 🗑️");
            refresh?.();

        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Delete failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">

                {/* HEADER */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">👤 {name}</h3>
                        <p className="text-sm text-gray-600 truncate">📧 {email}</p>
                        <p className="text-sm text-gray-600">📞 {phone}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">📍 {address}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {isBlocked ? "Blocked" : "Active"}
                    </span>
                </div>

                {/* STATS */}
                <div className="mt-3 flex justify-between text-sm">
                    <p className="text-blue-600">📦 Orders: <b>{ordersCount}</b></p>
                    <p className="text-green-600 font-semibold">₹{totalSpent}</p>
                </div>

                {/* ACTIONS */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setShowDetails(true)}
                        className="bg-gray-600 text-white px-3 py-1 rounded"
                    >
                        View
                    </button>

                    <button
                        onClick={toggleBlock}
                        disabled={loading}
                        className="bg-yellow-400 px-3 py-1 rounded"
                    >
                        {isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                        onClick={deleteCustomer}
                        disabled={loading}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                        Delete
                    </button>
                </div>

                {loading && <p className="text-xs mt-2">Processing...</p>}
            </div>

            {/* MODAL */}
            {showDetails && (
                <CustomerDetailsModal
                    customer={customer}
                    customerId={customerId} // ✅ FIX
                    close={() => setShowDetails(false)}
                />
            )}
        </>
    );
}