import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout, loading } = useAuth();

    // 🔐 Don't render navbar while loading
    if (loading) {
        return null;
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 px-6 py-4 flex justify-between items-center">

            {/* Logo */}
            <h2 className="text-xl font-bold text-orange-500">
                🍔 FoodApp
            </h2>

            {/* Links */}
            <div className="flex items-center gap-6 text-gray-700 font-medium">

                <Link to="/" className="hover:text-orange-500 transition">
                    Home
                </Link>

                {/* USER DASHBOARD */}
                {user?.role === "user" && (
                    <Link to="/user" className="hover:text-orange-500 transition">
                        Dashboard
                    </Link>
                )}

                {/* ADMIN DASHBOARD */}
                {user?.role === "admin" && (
                    <Link to="/admin" className="hover:text-orange-500 transition">
                        Admin Panel
                    </Link>
                )}

                {/* AUTH LINKS */}
                {!user ? (
                    <>
                        {/* User Login */}
                        <Link
                            to="/login"
                            className="hover:text-orange-500 transition"
                        >
                            User Login
                        </Link>

                        {/* Admin Login */}
                        <Link
                            to="/admin-login"
                            className="hover:text-orange-500 transition"
                        >
                            Admin Login
                        </Link>

                        {/* Signup (only for users) */}
                        <Link
                            to="/signup"
                            className="bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition"
                        >
                            Signup
                        </Link>
                    </>
                ) : (
                    <>
                        {/* Role Badge */}
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded hidden md:block">
                            {user.role}
                        </span>

                        {/* User Name */}
                        <span className="text-sm text-gray-500 hidden md:block">
                            Hi, {user.name || "User"} 👋
                        </span>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;