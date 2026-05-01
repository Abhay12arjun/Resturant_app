// src/services/adminApi.js
import axios from "axios";

const API = axios.create({
    baseURL: "https://resturant-app-i5ez.onrender.com/api", // backend URL
});

// Example API calls
export const getDashboard = () => API.get("/admin/dashboard");
export const getUsers = () => API.get("/admin/users");
export const getOrders = () => API.get("/admin/orders");


export default API;