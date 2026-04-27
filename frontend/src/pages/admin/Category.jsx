// Category component removed

export default function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [newCategory, setNewCategory] = useState("");
    const [newDescription, setNewDescription] = useState("");

    // Edit modal states
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);

    // ================= FETCH CATEGORIES =================
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await API.get("/category/admin/all");

            const data = res.data?.categories || res.data?.data || res.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.msg || "Failed to load categories ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ================= ADD CATEGORY =================
    const addCategory = async () => {
        if (!newCategory.trim()) {
            return toast.error("Enter category name ❌");
        }

        try {
            setActionLoading(true);

            const res = await API.post("/category", {
                name: newCategory.trim(),
                description: newDescription.trim(),
            });

            toast.success(res.data?.msg || "Category added ✅");
            setNewCategory("");
            setNewDescription("");
            fetchCategories();
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.msg || "Failed to add category ❌");
        } finally {
            setActionLoading(false);
        }
    };

    // ================= OPEN EDIT MODAL =================
    const openEditModal = (category) => {
        setEditingId(category._id);
        setEditName(category.name);
        setEditDescription(category.description || "");
        setShowEditModal(true);
    };

    // ================= UPDATE CATEGORY =================
    const updateCategory = async () => {
        if (!editName.trim()) {
            return toast.error("Category name cannot be empty ❌");
        }

        try {
            setActionLoading(true);

            const res = await API.put(`/category/${editingId}`, {
                name: editName.trim(),
                description: editDescription.trim(),
            });

            toast.success(res.data?.msg || "Category updated ✅");
            setShowEditModal(false);
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.msg || "Failed to update category ❌");
        } finally {
            setActionLoading(false);
        }
    };

    // ================= DELETE CATEGORY =================
    const deleteCategory = async (id, name) => {
        const confirmDelete = window.confirm(`Delete "${name}" category?`);

        if (!confirmDelete) return;

        try {
            setActionLoading(true);

            const res = await API.delete(`/category/${id}`);

            toast.success(res.data?.msg || "Category deleted 🗑️");
            fetchCategories();
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.msg || "Delete failed ❌");
        } finally {
            setActionLoading(false);
        }
    };

    // ================= TOGGLE STATUS =================
    const toggleStatus = async (id) => {
        try {
            setActionLoading(true);

            const res = await API.put(`/category/${id}/toggle-status`);

            toast.success(res.data?.msg || "Status updated ✅");
            fetchCategories();
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.msg || "Failed to toggle status ❌");
        } finally {
            setActionLoading(false);
        }
    };

    // ================= LOADING STATE =================
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <p className="text-gray-500 text-lg">Loading categories... 📂</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">📂 Manage Categories</h1>

                <button
                    onClick={fetchCategories}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* ADD CATEGORY FORM */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-green-500">
                <h2 className="text-xl font-bold text-gray-800 mb-4">➕ Add New Category</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Category Name *</label>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g., Pizza, Burgers, Desserts"
                            className="w-full border-2 border-gray-300 focus:border-green-500 px-4 py-2 rounded-lg focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Description</label>
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Brief description (optional)"
                            rows="3"
                            className="w-full border-2 border-gray-300 focus:border-green-500 px-4 py-2 rounded-lg focus:outline-none transition"
                        />
                    </div>

                    <button
                        onClick={addCategory}
                        disabled={actionLoading}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                        {actionLoading ? "Adding..." : "✅ Add Category"}
                    </button>
                </div>
            </div>

            {/* CATEGORIES LIST */}
            {categories.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">😢 No categories found</p>
                    <p className="text-gray-400 text-sm mt-2">Create your first category above</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div
                            key={cat._id}
                            className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border-t-4 ${cat.isActive ? "border-blue-500" : "border-red-500 opacity-60"
                                }`}
                        >
                            {/* Category Name */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(cat.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}>
                                    {cat.isActive ? "✅ Active" : "❌ Inactive"}
                                </span>
                            </div>

                            {/* Description */}
                            {cat.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {cat.description}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    disabled={actionLoading}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition text-sm font-semibold"
                                >
                                    ✎ Edit
                                </button>

                                <button
                                    onClick={() => toggleStatus(cat._id)}
                                    disabled={actionLoading}
                                    className={`flex-1 ${cat.isActive
                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                        : "bg-purple-500 hover:bg-purple-600"
                                        } disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition text-sm font-semibold`}
                                >
                                    {cat.isActive ? "🔒 Disable" : "🔓 Enable"}
                                </button>

                                <button
                                    onClick={() => deleteCategory(cat._id, cat.name)}
                                    disabled={actionLoading}
                                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition text-sm font-semibold"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">✎ Edit Category</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Category Name *</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-2 rounded-lg focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Brief description (optional)"
                                    rows="3"
                                    className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-2 rounded-lg focus:outline-none transition"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingId(null);
                                    }}
                                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={updateCategory}
                                    disabled={actionLoading}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition"
                                >
                                    {actionLoading ? "Saving..." : "💾 Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}