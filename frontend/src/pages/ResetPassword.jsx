import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            return setError("All fields are required");
        }

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setLoading(true);
            setError("");

            await API.put(`/auth/reset-password/${token}`, { password });

            setSuccess("Password reset successfully 🎉");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.msg || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 px-4">

            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-100">

                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Reset Password 🔐
                </h2>
                <p className="text-center text-gray-500 text-sm mb-6">
                    Enter your new password below
                </p>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg mb-4 text-sm">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg text-white font-semibold transition flex justify-center items-center
                        ${loading
                                ? "bg-indigo-300 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"}`}
                    >
                        {loading ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Back to{" "}
                    <a href="/login" className="text-indigo-600 font-semibold hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;