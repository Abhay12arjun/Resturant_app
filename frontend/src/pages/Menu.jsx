import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const Menu = () => {
    const [foods, setFoods] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [includeCutlery, setIncludeCutlery] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();

    const fetchFoods = async (category) => {
        try {
            const url = category ? `/food?category=${encodeURIComponent(category)}` : "/food";
            const res = await API.get(url);
            setFoods(res.data);
        } catch (err) {
            console.error("Error fetching foods:", err);
            toast.error("Failed to load menu");
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get("category");
        fetchFoods(category);
        // ensure menu opens scrolled to top when navigated to
        try {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
            // ignore in non-browser environments
        }
    }, [location.search]);

    const params = new URLSearchParams(location.search);
    const currentCategory = params.get("category") || "all";

    const applyCategory = (cat) => {
        if (!cat || cat === "all") {
            navigate('/menu');
        } else {
            navigate(`/menu?category=${encodeURIComponent(cat)}`);
        }
    };

    const handleFoodClick = (food) => {
        setSelectedFood(food);
        setQuantity(1);
        setIncludeCutlery(true);
    };

    const closeModal = () => {
        setSelectedFood(null);
        setQuantity(1);
    };

    const handleAddToCart = async () => {
        if (!selectedFood) return;

        if (!user) {
            toast.error("Please login to add items to cart");
            return;
        }

        try {
            const ok = await addToCart(selectedFood, quantity, { cutlery: includeCutlery });
            if (ok) closeModal();
        } catch (err) {
            console.error("Add to cart failed:", err);
        }
    };

    const handleOrderNow = async () => {
        if (!selectedFood) return;

        if (!user) {
            toast.error("Please login to order");
            navigate("/login");
            return;
        }

        try {
            const ok = await addToCart(selectedFood, quantity, { cutlery: includeCutlery });
            if (ok) {
                closeModal();
                navigate("/checkout");
            }
        } catch (err) {
            console.error("Order now failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-8 py-8">

            <h1 className="text-3xl font-bold text-center mb-10">
                Our Menu 🍽️
            </h1>

            {/* Filter Bar */}
            <div className="flex justify-center gap-3 mb-6">
                {[
                    { key: "all", label: "All" },
                    { key: "veg", label: "Veg" },
                    { key: "non-veg", label: "Non-Veg" },
                    { key: "pizza", label: "Pizza" },
                    { key: "burger", label: "Burgers" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => applyCategory(f.key === "all" ? "all" : f.key)}
                        className={`px-4 py-2 rounded-lg font-medium ${currentCategory === f.key || (currentCategory === "all" && f.key === "all") ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foods.map((item) => (
                    <div
                        key={item._id}
                        onClick={() => handleFoodClick(item)}
                        className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition cursor-pointer hover:scale-105"
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                        />

                        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                            {item.name}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {item.description}
                        </p>

                        <div className="flex justify-between items-center mt-3 gap-2">
                            <span className="text-indigo-600 font-bold text-lg">
                                ₹{item.price}
                            </span>

                            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                {item.category}
                            </span>
                        </div>

                        <button className="w-full mt-4 bg-indigo-600 text-white py-2.5 text-sm font-semibold rounded-lg hover:bg-indigo-700 transition">
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedFood && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>

                        {/* Food Image */}
                        <img
                            src={selectedFood.image}
                            alt={selectedFood.name}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                        />

                        {/* Food Details */}
                        <h2 className="text-lg font-bold text-gray-800 mb-1">
                            {selectedFood.name}
                        </h2>

                        <p className="text-gray-600 mb-2 text-sm">
                            {selectedFood.description}
                        </p>

                        <div className="flex items-center justify-between mb-3 gap-2">
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                {selectedFood.category}
                            </span>
                            <span className="text-lg font-bold text-indigo-600">
                                ₹{selectedFood.price}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-3">
                            <span className="text-sm text-gray-700 font-medium">Qty:</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="bg-white border border-gray-300 px-2 py-0.5 rounded text-sm hover:bg-gray-200 transition"
                                >
                                    −
                                </button>
                                <span className="text-sm font-semibold w-6 text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="bg-white border border-gray-300 px-2 py-0.5 rounded text-sm hover:bg-gray-200 transition"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Cutlery Option */}
                        <div className="flex items-center gap-3 mb-3">
                            <input
                                id="cutlery"
                                type="checkbox"
                                checked={includeCutlery}
                                onChange={() => setIncludeCutlery((s) => !s)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="cutlery" className="text-sm text-gray-700">
                                Include cutlery
                            </label>
                        </div>

                        {/* Total Price */}
                        <div className="bg-indigo-50 p-2 rounded-lg mb-3 text-center">
                            <p className="text-xs text-gray-600">Total</p>
                            <p className="text-lg font-bold text-indigo-600">
                                ₹{selectedFood.price * quantity}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gray-200 text-gray-800 py-1.5 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
                            >
                                🛒 Cart
                            </button>
                            <button
                                onClick={handleOrderNow}
                                className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                            >
                                🚀 Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Menu;