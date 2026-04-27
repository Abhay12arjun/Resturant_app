import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    // 🔐 While loading, don't render anything (App.jsx handles the global loading screen)
    if (loading) {
        return null;
    }

    // ❌ Not authenticated
    if (!user) return <Navigate to="/login" />;

    // ❌ Wrong role
    if (role && user.role !== role) {
        return <Navigate to="/" />;
    }

    // ✅ Authenticated with correct role
    return children;
};

export default ProtectedRoute;