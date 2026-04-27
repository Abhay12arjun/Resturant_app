import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
    const navigate = useNavigate(); // ✅ ADD THIS

    const {
        cart,
        loading,
        fetchCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getTotalPrice,
        getTotalItems,
    } = useCart();

    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // 🔥 FETCH CART ON PAGE OPEN
    useEffect(() => {
        fetchCart();
    }, []);

    // ================= CHECKOUT =================
    const handleCheckout = () => {
        if (cart.length === 0) {
            return toast.error("Your cart is empty 🛒");
        }

        setCheckoutLoading(true);

        // simulate small delay for UX
        setTimeout(() => {
            navigate("/checkout");
        }, 500);
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading cart... 🛒</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6">
                Your Cart 🛒 ({getTotalItems()} items)
            </h2>

            {cart.length === 0 ? (
                <div className="text-center mt-20">
                    <h3 className="text-xl text-gray-600">
                        Your cart is empty 😢
                    </h3>
                    <p className="text-gray-400">
                        Add some delicious food!
                    </p>
                </div>
            ) : (
                <>
                    {/* ================= ITEMS ================= */}
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div
                                key={`${item.food._id}-${item.cutlery ? 'c' : 'n'}`}
                                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                            >
                                {/* LEFT */}
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {item.food.name}
                                    </h3>
                                    <p className="text-gray-500">
                                        ₹{item.food.price}
                                    </p>
                                    {item.cutlery && (
                                        <p className="text-sm text-gray-500">Includes cutlery</p>
                                    )}
                                </div>

                                {/* RIGHT */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.food._id, "dec", item.cutlery || false)
                                        }
                                        className="px-3 py-1 bg-gray-200 rounded"
                                    >
                                        -
                                    </button>

                                    <span className="font-semibold">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            updateQuantity(item.food._id, "inc", item.cutlery || false)
                                        }
                                        className="px-3 py-1 bg-gray-200 rounded"
                                    >
                                        +
                                    </button>

                                    <button
                                        onClick={() =>
                                            removeFromCart(item.food._id, item.cutlery || false)
                                        }
                                        className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ================= SUMMARY ================= */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow">
                        <h3 className="text-lg font-semibold mb-3">
                            Cart Summary
                        </h3>

                        <div className="flex justify-between mb-2">
                            <span>Total Items:</span>
                            <span>{getTotalItems()}</span>
                        </div>

                        <div className="flex justify-between text-xl font-bold">
                            <span>Total Price:</span>
                            <span>₹{getTotalPrice()}</span>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={clearCart}
                                className="flex-1 bg-gray-500 text-white py-2 rounded-lg"
                            >
                                Clear Cart 🧹
                            </button>

                            <button
                                onClick={handleCheckout}
                                disabled={checkoutLoading}
                                className={`flex-1 py-2 rounded-lg text-white
                                ${checkoutLoading
                                        ? "bg-green-300"
                                        : "bg-green-500 hover:bg-green-600"
                                    }`}
                            >
                                {checkoutLoading
                                    ? "Redirecting..."
                                    : "Checkout 🚀"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}