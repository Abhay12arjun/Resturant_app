import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminLogin } from "../api/api";

const AdminLogin = () => {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 🔐 Redirect if already logged in as admin (wait for AuthContext to load first)
    useEffect(() => {
        if (!loading && user && user.role === "admin") {
            navigate("/admin");
        }
    }, [loading, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setError("Email and password are required");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            const res = await adminLogin(form);

            if (res.data && res.data.user && res.data.user.role === "admin") {
                login(res.data);
                navigate("/admin");
            } else {
                setError("Invalid admin credentials");
            }
        } catch (err) {
            setError(err.response?.data?.msg || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow w-80"
            >
                <h2 className="text-xl font-bold mb-4 text-center">
                    Admin Login 🔐
                </h2>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    className="w-full mb-3 p-2 border rounded"
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    className="w-full mb-3 p-2 border rounded"
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Logging in..." : "Login as Admin"}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;