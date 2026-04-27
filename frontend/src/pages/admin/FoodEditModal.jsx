import { useState } from "react";
import API from "../../api/api";

export default function FoodEditModal({ item, close, refresh }) {

    const [form, setForm] = useState({
        name: item.name || "",
        price: item.price || "",
        category: item.category || "veg",
        description: item.description || "",
        image: null,
    });

    const update = async () => {
        try {
            // ✅ Validation
            if (!form.name || !form.price) {
                alert("Name and Price are required");
                return;
            }

            const data = new FormData();

            Object.keys(form).forEach((key) => {
                if (form[key] !== null && form[key] !== "") {
                    data.append(key, form[key]);
                }
            });

            // ❌ Don't manually set Content-Type
            await API.put(`/food/${item._id}`, data);

            refresh();
            close();

        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update food");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

            <div className="bg-white p-5 w-96 space-y-3 rounded-lg shadow">

                <h2 className="text-xl font-bold">Edit Food</h2>

                {/* NAME */}
                <input
                    type="text"
                    placeholder="Name"
                    className="border p-2 w-full"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                {/* PRICE ✅ FIXED */}
                <input
                    type="number"
                    placeholder="Price"
                    className="border p-2 w-full"
                    value={form.price}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            price: e.target.value.replace(/[^0-9]/g, ""), // ✅ only numbers
                        })
                    }
                />

                {/* CATEGORY */}
                <select
                    className="border p-2 w-full"
                    value={form.category}
                    onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                    }
                >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="pizza">Pizza</option>
                    <option value="burger">Burgers</option>
                    <option value="drinks">Drinks</option>
                    <option value="desserts">Desserts</option>
                </select>

                {/* DESCRIPTION */}
                <textarea
                    placeholder="Description"
                    className="border p-2 w-full"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />

                {/* IMAGE */}
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setForm({ ...form, image: e.target.files[0] })
                    }
                />

                {/* PREVIEW (Cloudinary URL) */}
                {item.image && (
                    <img
                        src={item.image}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded"
                    />
                )}

                {/* BUTTONS */}
                <div className="flex justify-between">
                    <button
                        onClick={update}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                    >
                        Update
                    </button>

                    <button
                        onClick={close}
                        className="bg-gray-400 hover:bg-gray-500 px-4 py-1 rounded"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
}