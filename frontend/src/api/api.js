import axios from "axios";

// ================= BASE API INSTANCE =================
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://resturant-app-i5ez.onrender.com/api",
  withCredentials: true,
  timeout: 10000, // ⏱️ prevent hanging requests
});

// ================= REQUEST INTERCEPTOR =================
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("❌ Network error / Server unreachable");
      return Promise.reject(error);
    }

    const { status, config, data } = error.response;
    const url = config?.url || "";

    const isCartAPI = url.includes("/cart");
    const isAuthAPI = url.includes("/auth");

    // ================= 🔐 UNAUTHORIZED =================
    if (status === 401) {
      console.warn("⚠️ Unauthorized access");

      // ❗ Don't logout for cart fetch failures
      if (!isCartAPI && !isAuthAPI) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // ================= ❌ FORBIDDEN =================
    if (status === 403) {
      console.error("🚫 Access denied");
    }

    // ================= 💥 SERVER ERROR =================
    if (status >= 500) {
      console.error("💥 Server error:", data?.message || "Unknown error");
    }

    return Promise.reject(error);
  }
);



// ================= AUTH APIs =================

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const adminLogin = (data) =>
  API.post("/auth/admin-login", data);

export const googleAuth = (data) =>
  API.post("/auth/google", data);

export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  API.put(`/auth/reset-password/${token}`, { password });

// 🔐 Verify token
export const verifyToken = () =>
  API.get("/auth/verify");

// ✅ Logout helper (frontend)
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};



// ================= USER APIs =================

export const getUserProfile = () =>
  API.get("/user/profile");



// ================= ADMIN APIs =================

export const getAdminData = () =>
  API.get("/auth/admin");



// ================= 🍔 FOOD APIs =================

export const getAllFoods = () =>
  API.get("/food");

export const getFoodById = (id) =>
  API.get(`/food/${id}`);



// ================= 🛒 CART APIs =================

export const addToCartAPI = (foodId) =>
  API.post("/cart/add", { foodId });

export const getCartAPI = () =>
  API.get("/cart");

// 🔥 FIXED endpoint (match backend)
export const removeFromCartAPI = (foodId) =>
  API.delete(`/cart/${foodId}`);

export const clearCartAPI = () =>
  API.delete("/cart/clear");



// ================= 📦 ORDER APIs =================

export const placeOrderAPI = (data) =>
  API.post("/orders", data);

export const getMyOrdersAPI = () =>
  API.get("/orders/my");

export const getOrderByIdAPI = (id) =>
  API.get(`/orders/${id}`);



// ================= 💳 PAYMENT APIs =================

export const getUpiConfigAPI = () =>
  API.get("/payment/upi-config");

export const createUpiPaymentAPI = (data) =>
  API.post("/payment/upi", data);

export const verifyUpiPaymentAPI = (paymentId) =>
  API.get(`/payment/verify/${paymentId}`);



// ================= EXPORT =================
export default API;
