// src/services/adminApi.js
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // backend URL
});

// Example API calls
export const getDashboard = () => API.get("/admin/dashboard");
export const getUsers = () => API.get("/admin/users");
export const getOrders = () => API.get("/admin/orders");


export default API;