import { useEffect, useState } from "react";
import API from "../../api/api";
import FoodEditModal from "./FoodEditModal";

export default function FoodList() {
    const [foods, setFoods] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch foods
    const fetchFoods = async () => {
        try {
            setLoading(true);
            const res = await API.get("/food");
            setFoods(res.data);
        } catch (err) {
            console.error("Error fetching foods:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, []);

    // ✅ Delete food with confirmation
    const deleteFood = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this food?");
        if (!confirmDelete) return;

        try {
            await API.delete(`/food/${id}`);
            fetchFoods();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    // ✅ Toggle availability
    // const toggle = async (id) => {
    //     try {
    //         await API.patch(`/food/${id}/toggle`);
    //         fetchFoods();
    //     } catch (err) {
    //         console.error("Toggle failed:", err);
    //     }
    // };

    const toggle = async (id) => {
        try {
            const res = await API.patch(`/food/${id}/toggle`);

            setFoods(prev =>
                prev.map(item =>
                    item._id === id
                        ? { ...item, isAvailable: res.data.isAvailable }
                        : item
                )
            );
        } catch (err) {
            console.error("Toggle failed:", err);
        }
    };

    return (
        <div className="space-y-4">
            {/* 🔄 Loading */}
            {loading && <p className="text-center">Loading foods...</p>}

            {/* ❌ Empty */}
            {!loading && foods.length === 0 && (
                <p className="text-center text-gray-500">No food items found</p>
            )}

            {/* 🍔 Food List */}
            {foods.map((f) => (
                <div
                    key={f._id}
                    className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                >
                    {/* LEFT */}
                    <div className="flex gap-4">
                        <img
                            src={f.image}
                            alt={f.name}
                            className="w-20 h-20 object-cover rounded"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/80";
                            }}
                        />

                        <div>
                            <h3 className="font-bold text-lg">{f.name}</h3>
                            <p className="text-gray-700">₹{f.price}</p>
                            <p className="text-sm text-gray-500">{f.category}</p>

                            <p
                                className={`text-sm font-semibold ${f.isAvailable ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {f.isAvailable ? "Available" : "Out of Stock"}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditItem(f)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => toggle(f._id)}
                            className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded"
                        >
                            Toggle
                        </button>

                        <button
                            onClick={() => deleteFood(f._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}

            {/* ✏️ Edit Modal */}
            {editItem && (
                <FoodEditModal
                    item={editItem}
                    close={() => setEditItem(null)}
                    refresh={fetchFoods}
                />
            )}
        </div>
    );
}