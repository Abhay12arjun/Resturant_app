export default function OrderDetailsModal({ order, close }) {
    // Helper to format date
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString();
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "preparing": return "bg-blue-100 text-blue-700";
            case "out_for_delivery": return "bg-purple-100 text-purple-700";
            case "delivered": return "bg-green-100 text-green-700";
            case "cancelled": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    // Calculate item totals
    const getItemTotal = (item) => {
        return (item.price || 0) * (item.quantity || 0);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                
                {/* HEADER */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Order Details</h2>
                        <button 
                            onClick={close}
                            className="text-white hover:bg-orange-700 p-2 rounded-lg"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-orange-100 text-sm mt-1">Order ID: {order._id}</p>
                </div>

                <div className="p-5 space-y-5">

                    {/* ORDER INFO ROW */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Status</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status?.replaceAll("_", " ").toUpperCase()}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="font-bold text-lg text-green-600">₹{order.totalAmount}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Payment</p>
                            <p className="font-medium">{order.paymentMethod}</p>
                            <p className={`text-xs ${order.isPaid ? "text-green-600" : "text-orange-600"}`}>
                                {order.isPaid ? "✅ Paid" : "❌ Not Paid"}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Order Date</p>
                            <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                    </div>

                    {/* CUSTOMER INFO */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-lg mb-3">👤 Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{order.customer?.name || order.customerName || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{order.customer?.phone || "N/A"}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Delivery Address</p>
                                <p className="font-medium">
                                    {order.customer?.address || "N/A"}
                                    {order.customer?.city && `, ${order.customer.city}`}
                                    {order.customer?.pincode && ` - ${order.customer.pincode}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ORDER ITEMS */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-lg mb-3">🍔 Order Items</h3>
                        <div className="space-y-2">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-500">
                                            ₹{item.price} × {item.quantity}
                                            {item.cutlery && " (with cutlery)"}
                                        </p>
                                    </div>
                                    <p className="font-semibold">₹{getItemTotal(item)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                            <p className="font-semibold">Total</p>
                            <p className="font-bold text-xl text-green-600">₹{order.totalAmount}</p>
                        </div>
                    </div>

                    {/* ORDER TIMELINE */}
                    {order.statusTimestamps && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-lg mb-3">📅 Order Timeline</h3>
                            <div className="space-y-2 text-sm">
                                {order.statusTimestamps.pending && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">🕐 Order Placed</span>
                                        <span>{formatDate(order.statusTimestamps.pending)}</span>
                                    </div>
                                )}
                                {order.statusTimestamps.preparing && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">👨‍🍳 Preparing</span>
                                        <span>{formatDate(order.statusTimestamps.preparing)}</span>
                                    </div>
                                )}
                                {order.statusTimestamps.out_for_delivery && (
                                    <div className="flex justify-between">
                                        <span className="text-purple-600">🚴 Out for Delivery</span>
                                        <span>{formatDate(order.statusTimestamps.out_for_delivery)}</span>
                                    </div>
                                )}
                                {order.statusTimestamps.delivered && (
                                    <div className="flex justify-between">
                                        <span className="text-green-600">✅ Delivered</span>
                                        <span>{formatDate(order.statusTimestamps.delivered)}</span>
                                    </div>
                                )}
                                {order.statusTimestamps.cancelled && (
                                    <div className="flex justify-between">
                                        <span className="text-red-600">❌ Cancelled</span>
                                        <span>{formatDate(order.statusTimestamps.cancelled)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CANCELLATION INFO */}
                    {order.status === "cancelled" && (
                        <div className="border-t pt-4">
                            <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-red-600 font-medium">⚠️ Order Cancelled</p>
                                {order.cancelledBy && (
                                    <p className="text-sm text-red-500">Cancelled by: {order.cancelledBy}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CLOSE BUTTON */}
                    <div className="border-t pt-4">
                        <button
                            onClick={close}
                            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}