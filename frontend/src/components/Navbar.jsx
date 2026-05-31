import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🔐 Don't render navbar while loading
    if (loading) {
        return null;
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="px-4 md:px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <h2 className="text-lg md:text-xl font-bold text-orange-500">
                    🍔 FoodApp
                </h2>

                {/* Hamburger Menu Icon - Mobile Only */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden flex flex-col gap-1.5 cursor-pointer focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <div className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </button>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">

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
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {user.role}
                            </span>

                            {/* User Name */}
                            <span className="text-sm text-gray-500">
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
            </div>

            {/* Mobile Menu - Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">

                    <Link
                        to="/"
                        onClick={closeMenu}
                        className="block text-gray-700 font-medium hover:text-orange-500 transition py-2"
                    >
                        Home
                    </Link>

                    {/* USER DASHBOARD */}
                    {user?.role === "user" && (
                        <Link
                            to="/user"
                            onClick={closeMenu}
                            className="block text-gray-700 font-medium hover:text-orange-500 transition py-2"
                        >
                            Dashboard
                        </Link>
                    )}

                    {/* ADMIN DASHBOARD */}
                    {user?.role === "admin" && (
                        <Link
                            to="/admin"
                            onClick={closeMenu}
                            className="block text-gray-700 font-medium hover:text-orange-500 transition py-2"
                        >
                            Admin Panel
                        </Link>
                    )}

                    {/* AUTH LINKS */}
                    {!user ? (
                        <>
                            {/* User Login */}
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="block text-gray-700 font-medium hover:text-orange-500 transition py-2"
                            >
                                User Login
                            </Link>

                            {/* Admin Login */}
                            <Link
                                to="/admin-login"
                                onClick={closeMenu}
                                className="block text-gray-700 font-medium hover:text-orange-500 transition py-2"
                            >
                                Admin Login
                            </Link>

                            {/* Signup (only for users) */}
                            <Link
                                to="/signup"
                                onClick={closeMenu}
                                className="block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-center"
                            >
                                Signup
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* Role Badge */}
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-700 font-medium">
                                    {user.name || "User"}
                                </span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    {user.role}
                                </span>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={() => {
                                    logout();
                                    closeMenu();
                                }}
                                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;