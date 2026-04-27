import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Notifications from "./admin/Notifications";
import API from "../api/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const UserDashboard = () => {
    const navigate = useNavigate();

    const [foods, setFoods] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const { addToCart, cart } = useCart();

    // ================= FETCH FOOD =================
    const fetchFoods = async () => {
        try {
            const res = await API.get("/food");
            setFoods(res.data);
        } catch (err) {
            console.log(err);
            toast.error("Failed to load food ❌");
        } finally {
            setLoading(false);
        }
    };

    // ================= AUTO REFRESH =================
    useEffect(() => {
        fetchFoods();

        const interval = setInterval(fetchFoods, 8000); // better interval
        return () => clearInterval(interval);
    }, []);

    // ================= FIX: CART CHECK =================
    const isInCart = (foodId) => {
        return cart.some((item) =>
            item.food?._id === foodId || item._id === foodId
        );
    };

    // ================= ADD TO CART =================
    const handleAddToCart = async (food) => {
        try {
            setActionLoading(food._id);

            const ok = await addToCart(food);

            if (ok) {
                // close modal if open
                setSelectedFood(null);
            }

        } catch (err) {
            console.log(err);
        } finally {
            setActionLoading(null);
        }
    };

    // ================= ORDER NOW =================
    const orderNow = async (food) => {
        try {
            setActionLoading(food._id);

            const ok = await addToCart(food);

            if (ok) {
                toast.success("Redirecting to checkout 🚀");

                setSelectedFood(null);

                setTimeout(() => {
                    navigate("/cart"); // better than /checkout (based on your app)
                }, 500);
            }

        } catch (err) {
            console.log(err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* HEADER */}
            <div className="px-6 py-6 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Welcome Back 👋
                    </h2>
                    <p className="text-gray-500">
                        What would you like to eat today?
                    </p>
                </div>

                <div>
                    <Notifications />
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid md:grid-cols-3 gap-6 px-6">

                <Link to="/menu" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">🍕 Browse Menu</h3>
                    <p className="text-gray-500 text-sm">Explore all dishes</p>
                </Link>

                <Link to="/orders" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">📦 My Orders</h3>
                    <p className="text-gray-500 text-sm">Track your orders</p>
                </Link>

                <Link to="/cart" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">🛒 Cart</h3>
                    <p className="text-gray-500 text-sm">View cart items</p>
                </Link>

            </div>

            {/* FOOD LIST */}
            <div className="px-6 py-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Popular Dishes 🔥
                </h2>

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : foods.length === 0 ? (
                    <p>No food available</p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">

                        {foods.map((food) => (
                            <div
                                key={food._id}
                                onClick={() => setSelectedFood(food)}
                                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
                            >
                                <img
                                    src={food.image}
                                    alt={food.name}
                                    className="w-full h-40 object-cover"
                                />

                                <div className="p-4">
                                    <h3 className="font-semibold">{food.name}</h3>

                                    <p className="text-gray-500 mb-1">
                                        ₹{food.price}
                                    </p>

                                    {/* AVAILABILITY */}
                                    <p className={`text-xs font-semibold mb-2 ${food.isAvailable
                                        ? "text-green-600"
                                        : "text-red-500"
                                        }`}>
                                        {food.isAvailable
                                            ? "Available ✅"
                                            : "Not Available ❌"}
                                    </p>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(food);
                                        }}
                                        disabled={
                                            actionLoading === food._id ||
                                            !food.isAvailable
                                        }
                                        className={`w-full py-1.5 rounded-lg text-white transition
                                        ${!food.isAvailable
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : isInCart(food._id)
                                                    ? "bg-green-500"
                                                    : "bg-orange-500 hover:bg-orange-600"
                                            }`}
                                    >
                                        {actionLoading === food._id
                                            ? "Adding..."
                                            : !food.isAvailable
                                                ? "Unavailable"
                                                : isInCart(food._id)
                                                    ? "Added ✓"
                                                    : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>

            {/* MODAL */}
            {selectedFood && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

                    <div className="bg-white rounded-xl w-[90%] md:w-[500px] p-6 relative">

                        <button
                            onClick={() => setSelectedFood(null)}
                            className="absolute top-2 right-3 text-xl"
                        >
                            ✖
                        </button>

                        <img
                            src={selectedFood.image}
                            alt={selectedFood.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                        />

                        <h2 className="text-xl font-bold">{selectedFood.name}</h2>

                        <p className="text-gray-600">
                            ₹{selectedFood.price}
                        </p>

                        <p className={`text-sm font-semibold mb-2 ${selectedFood.isAvailable
                            ? "text-green-600"
                            : "text-red-500"
                            }`}>
                            {selectedFood.isAvailable
                                ? "Available ✅"
                                : "Not Available ❌"}
                        </p>

                        <p className="text-gray-500 text-sm mb-4">
                            {selectedFood.description}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAddToCart(selectedFood)}
                                disabled={
                                    actionLoading === selectedFood._id ||
                                    !selectedFood.isAvailable
                                }
                                className={`flex-1 py-2 rounded-lg text-white
                                ${selectedFood.isAvailable
                                        ? "bg-orange-500 hover:bg-orange-600"
                                        : "bg-gray-400"
                                    }`}
                            >
                                {actionLoading === selectedFood._id
                                    ? "Adding..."
                                    : selectedFood.isAvailable
                                        ? "Add to Cart"
                                        : "Unavailable"}
                            </button>

                            <button
                                onClick={() => orderNow(selectedFood)}
                                disabled={
                                    actionLoading === selectedFood._id ||
                                    !selectedFood.isAvailable
                                }
                                className={`flex-1 py-2 rounded-lg text-white
                                ${selectedFood.isAvailable
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-gray-400"
                                    }`}
                            >
                                {actionLoading === selectedFood._id
                                    ? "Processing..."
                                    : selectedFood.isAvailable
                                        ? "Order Now"
                                        : "Unavailable"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default UserDashboard;