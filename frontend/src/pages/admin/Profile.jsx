import { useEffect, useState } from "react";
import API from "../../api/api";

export default function Profile() {
    const [admin, setAdmin] = useState({ name: "", email: "" });
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ name: "", email: "" });

    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "", show: false });

    // 🔄 Fetch profile
    const fetchProfile = async () => {
        setProfileLoading(true);
        try {
            const res = await API.get("/admin/profile");
            setAdmin(res.data);
            setEditData({ name: res.data.name, email: res.data.email });
        } catch (err) {
            showMessage("error", err.response?.data?.msg || "Failed to load profile");
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // 📝 Show message
    const showMessage = (type, text, duration = 5000) => {
        setMessage({ type, text, show: true });
        if (duration) {
            setTimeout(() => setMessage({ type: "", text: "", show: false }), duration);
        }
    };

    // 📝 Handle edit profile
    const handleEditProfile = async (e) => {
        e.preventDefault();

        if (!editData.name.trim() || !editData.email.trim()) {
            showMessage("error", "Name and email are required");
            return;
        }

        if (!editData.email.includes("@")) {
            showMessage("error", "Please enter a valid email");
            return;
        }

        setLoading(true);
        try {
            const res = await API.put("/admin/profile", editData);
            setAdmin(res.data.user);
            setEditMode(false);
            showMessage("success", res.data.msg || "Profile updated successfully");
        } catch (err) {
            showMessage("error", err.response?.data?.msg || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // 🔐 Update password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Validation
        if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
            showMessage("error", "All password fields are required");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            showMessage("error", "New passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            showMessage("error", "Password must be at least 6 characters");
            return;
        }

        if (passwords.oldPassword === passwords.newPassword) {
            showMessage("error", "New password must be different from old password");
            return;
        }

        setLoading(true);
        try {
            await API.put("/admin/change-password", passwords);
            showMessage("success", "Password changed successfully");
            setPasswords({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            showMessage("error", err.response?.data?.msg || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    // 🚪 Logout
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/admin-login";
        }
    };

    if (profileLoading) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="flex items-center justify-center py-10">
                    <div className="text-gray-600">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 pb-10">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
                ⚙️ Admin Profile & Settings
            </h2>

            {/* Message Alert */}
            {message.show && (
                <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${message.type === "success"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}>
                    <span>
                        {message.type === "success" ? "✅" : "❌"} {message.text}
                    </span>
                    <button
                        onClick={() => setMessage({ type: "", text: "", show: false })}
                        className="text-lg font-bold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Profile Info Section */}
            <div className="bg-white p-6 shadow-md rounded-lg mb-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">👤 Profile Information</h3>
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                        >
                            ✎ Edit
                        </button>
                    )}
                </div>

                {!editMode ? (
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            <b className="text-gray-800">Name:</b> {admin.name || "Not set"}
                        </p>
                        <p className="text-gray-700">
                            <b className="text-gray-800">Email:</b> {admin.email || "Not set"}
                        </p>
                        <p className="text-gray-700">
                            <b className="text-gray-800">Role:</b> <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{admin.role || "user"}</span>
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleEditProfile} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Name</label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) =>
                                    setEditData({ ...editData, name: e.target.value })
                                }
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                value={editData.email}
                                onChange={(e) =>
                                    setEditData({ ...editData, email: e.target.value })
                                }
                                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition"
                            >
                                {loading ? "Saving..." : "💾 Save Changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditMode(false);
                                    setEditData({ name: admin.name, email: admin.email });
                                }}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-md transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Change Password Section */}
            <div className="bg-white p-6 shadow-md rounded-lg mb-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🔐 Change Password</h3>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                        <input
                            type="password"
                            placeholder="Enter your current password"
                            value={passwords.oldPassword}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    oldPassword: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password (min. 6 characters)"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    newPassword: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    confirmPassword: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md font-semibold transition"
                    >
                        {loading ? "Updating..." : "🔄 Update Password"}
                    </button>
                </form>
            </div>

            {/* Logout Section */}
            <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🚪 Logout</h3>
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-md font-semibold transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}