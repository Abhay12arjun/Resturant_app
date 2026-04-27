import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // 🔥 NEW
import API, { googleAuth } from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const Login = () => {
    const { login, user, loading } = useAuth();
    const { fetchCart } = useCart(); // 🔥 NEW
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // 🔥 Redirect if already logged in (wait for AuthContext to load first)
    useEffect(() => {
        if (!loading && user) {
            navigate(user.role === "admin" ? "/admin" : "/user");
        }
    }, [loading, user, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!form.email || !form.password) {
            return "All fields are required";
        }
        return null;
    };

    // ================= LOGIN =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const err = validate();
        if (err) {
            setError(err);
            toast.error(err);
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const res = await API.post("/auth/login", form);

            // ✅ Save auth
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            login(res.data);

            // 🔥 VERY IMPORTANT → LOAD CART
            await fetchCart();

            toast.success("Login successful ✅");

            navigate(
                res.data.user.role === "admin" ? "/admin" : "/user"
            );

        } catch (err) {
            const msg = err.response?.data?.msg || "Login failed";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ================= GOOGLE LOGIN =================
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = JSON.parse(
                atob(credentialResponse.credential.split(".")[1])
            );

            const res = await googleAuth({
                name: decoded.name,
                email: decoded.email,
                googleId: decoded.sub,
                profileImage: decoded.picture,
            });

            // ✅ Save auth
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            login(res.data);

            // 🔥 LOAD CART AFTER GOOGLE LOGIN
            await fetchCart();

            toast.success("Google login successful ✅");

            navigate(
                res.data.user.role === "admin" ? "/admin" : "/user"
            );

        } catch (error) {
            console.log(error);
            toast.error("Google login failed ❌");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">

            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-100">

                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Welcome Back 👋
                </h2>
                <p className="text-center text-gray-500 mb-6 text-sm">
                    Login to continue your food journey 🍕
                </p>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition"
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-orange-500 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 rounded-lg text-white font-semibold transition flex items-center justify-center
                        ${isLoading
                                ? "bg-orange-300 cursor-not-allowed"
                                : "bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg"}`}
                    >
                        {isLoading ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400">OR CONTINUE WITH</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Google Login */}
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google Login Failed")}
                    />
                </div>

                {/* Signup */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Don’t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-orange-500 font-semibold hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;