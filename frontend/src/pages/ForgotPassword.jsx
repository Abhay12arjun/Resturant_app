import { useState } from "react";
import API from "../api/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await API.post("/auth/forgot-password", { email });
            alert("Reset link sent to your email 📩");
        } catch (error) {
            alert("Something went wrong ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Forgot Password
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Enter your email to receive a reset link
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded-lg text-white font-semibold transition 
                        ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"}`}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                </form>

                {/* Back to Login */}
                <p className="text-sm text-center text-gray-600 mt-4">
                    Remember your password?{" "}
                    <a href="/login" className="text-indigo-600 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;