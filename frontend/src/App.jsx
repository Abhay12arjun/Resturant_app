import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ ADD THIS
import { useAuth } from "./context/AuthContext"; // 🔐 NEW

import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminLogin from "./pages/AdminLogin";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";





import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      {/* ✅ GLOBAL TOAST (VERY IMPORTANT) */}
      <Toaster position="top-right" reverseOrder={false} />

      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { loading } = useAuth(); // 🔐 NEW

  // 🔐 Show loading while verifying token
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>

        {/* HOME */}
        <Route index element={<Home />} />

        {/* PUBLIC ROUTES */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="menu" element={<Menu />} />
        <Route path="login" element={<Login />} />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />

        {/* USER */}
        <Route
          path="user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Route>
    </Routes>
  );
}

export default App;