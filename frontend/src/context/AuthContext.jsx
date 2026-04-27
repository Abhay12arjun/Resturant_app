import { createContext, useContext, useEffect, useState } from "react";
import { verifyToken } from "../api/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyStoredToken = async () => {
            try {
                const token = localStorage.getItem("token");
                const stored = localStorage.getItem("user");

                if (token && stored) {
                    // 🔐 Verify token with backend
                    const res = await verifyToken();

                    if (res.data.valid) {
                        setUser(res.data.user);
                    } else {
                        // ❌ Token is invalid, clear storage
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                // ❌ Token verification failed, clear storage
                console.error("Token verification failed:", error.message);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyStoredToken();
    }, []);

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};