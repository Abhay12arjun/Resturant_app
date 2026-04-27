import { useState } from "react";
import API from "../../api/api";

export default function FoodForm() {
    const [form, setForm] = useState({
        name: "",
        price: "",
        category: "veg",
        description: "",
        image: null,
    });

    const submit = async () => {
        try {
            // ✅ Basic validation
            if (!form.name || !form.price) {
                alert("Name and Price are required");
                return;
            }

            const data = new FormData();

            // ✅ Append only non-empty values
            Object.keys(form).forEach((key) => {
                if (form[key] !== null && form[key] !== "") {
                    data.append(key, form[key]);
                }
            });

            // ✅ DO NOT set Content-Type manually
            await API.post("/food", data);

            alert("Food added successfully!");
            window.location.reload();

        } catch (error) {
            console.error("Error adding food:", error);
            alert("Failed to add food");
        }
    };

    return (
        <div className="bg-white p-4 shadow mb-4 space-y-2">

            <input
                placeholder="Name"
                className="border p-2 w-full"
                value={form.name}
                onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                }
            />

            <input
                type="number"
                placeholder="Price"
                className="border p-2 w-full"
                value={form.price}
                onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                }
            />

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

            <textarea
                placeholder="Description"
                className="border p-2 w-full"
                value={form.description}
                onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                }
            />

            <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                    setForm({ ...form, image: e.target.files[0] })
                }
            />

            <button
                onClick={submit}
                className="bg-blue-500 text-white px-4 py-2 w-full"
            >
                Add Food
            </button>
        </div>
    );
}