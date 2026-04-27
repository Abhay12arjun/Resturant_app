import { createContext, useContext, useState, useEffect, useRef } from "react";
import API from "../api/api";
import { useAuth } from "./AuthContext";
import { io } from "socket.io-client";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user, loading } = useAuth();
    const [notifications, setNotifications] = useState([]);
    // keep a map of previous orders to detect status changes: { orderId: status }
    const prevOrdersRef = useRef({});
    // keep a set of new-order ids we've already notified about to avoid duplicates
    const notifiedNewOrderIdsRef = useRef(new Set());
    const socketRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // 🔔 Poll orders every 3 seconds (only when authenticated)
    useEffect(() => {
        if (!loading && user) {
            // Reset previous-order and notified sets when user changes
            prevOrdersRef.current = {};
            notifiedNewOrderIdsRef.current.clear();

            fetchOrders();
            const interval = setInterval(fetchOrders, 3000);

            return () => clearInterval(interval);
        }
    }, [user, loading]);

    // ================= SOCKET (real-time) =================
    useEffect(() => {
        if (!user || loading) return;
        // reset dedupe state for this user session
        prevOrdersRef.current = {};
        notifiedNewOrderIdsRef.current.clear();

        // derive socket base URL from API base
        const SOCKET_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

        const socket = io(SOCKET_BASE, { transports: ["websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            // join room based on role
            if (user.role === "admin") {
                socket.emit("joinAdmin");
            } else {
                const uid = user._id || user.id;
                if (uid) socket.emit("joinUser", uid);
            }
        });

        // Admin: real-time new order
        socket.on("newOrder", (order) => {
            if (user.role !== "admin") return;
            if (notifiedNewOrderIdsRef.current.has(order._id)) return;

            notifiedNewOrderIdsRef.current.add(order._id);

            const notification = {
                id: Date.now() + Math.random(),
                type: "newOrder",
                orderId: order._id,
                customerName: order.customer?.name || order.user?.name || "Customer",
                totalAmount: order.totalAmount,
                timestamp: new Date(),
                message: `🆕 New Order from ${order.customer?.name || order.user?.name || "Customer"} - ₹${order.totalAmount}`,
                isRead: false,
            };

            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            playNotificationSound();
        });

        // User: real-time order updates
        socket.on("orderUpdated", (order) => {
            // notify only the owner (or admin)
            const orderUserId = order.user?._id || order.user;
            const currentUserId = user._id || user.id;
            const isOwner = String(currentUserId) === String(orderUserId);
            if (!(isOwner || user.role === "admin")) return;

            const prevStatus = prevOrdersRef.current[order._id];
            if (prevStatus === order.status) return; // already known

            const notification = {
                id: Date.now() + Math.random(),
                type: "statusUpdate",
                orderId: order._id,
                status: order.status,
                timestamp: new Date(),
                message: `🔄 Order #${order._id.slice(-4)} → ${order.status}`,
                isRead: false,
            };

            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // update known status
            prevOrdersRef.current[order._id] = order.status;
        });

        // Admin: other admins' status changes
        socket.on("orderStatusChanged", (order) => {
            if (user.role !== "admin") return;

            const prevStatus = prevOrdersRef.current[order._id];
            if (prevStatus === order.status) return;

            const notification = {
                id: Date.now() + Math.random(),
                type: "statusUpdate",
                orderId: order._id,
                status: order.status,
                timestamp: new Date(),
                message: `🔄 Order #${order._id.slice(-4)} → ${order.status}`,
                isRead: false,
            };

            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            prevOrdersRef.current[order._id] = order.status;
        });

        return () => {
            try {
                socket.disconnect();
            } catch (e) { }
            socketRef.current = null;
        };
    }, [user, loading]);


    const fetchOrders = async () => {
        if (!user) return;

        try {
            // ✅ Use correct endpoint based on user role
            const endpoint = user.role === "admin" ? "/orders" : "/orders/my";
            const res = await API.get(endpoint);

            if (!res.data) return;

            const orders = res.data;

            // Build a map of current orders
            const currentOrdersMap = {};
            orders.forEach((o) => (currentOrdersMap[o._id] = o.status));

            // If this is the very first fetch, initialize prevOrders and don't notify
            if (Object.keys(prevOrdersRef.current).length === 0) {
                prevOrdersRef.current = currentOrdersMap;
                return;
            }

            // 🆕 Detect new orders (only for admin notifications)
            if (user.role === "admin") {
                const newOrders = orders.filter((order) => !(order._id in prevOrdersRef.current));

                newOrders.forEach((order) => {
                    if (notifiedNewOrderIdsRef.current.has(order._id)) return;

                    notifiedNewOrderIdsRef.current.add(order._id);

                    const notification = {
                        id: Date.now() + Math.random(),
                        type: "newOrder",
                        orderId: order._id,
                        customerName: order.customer?.name || order.user?.name || "Customer",
                        totalAmount: order.totalAmount,
                        timestamp: new Date(),
                        message: `🆕 New Order from ${order.customer?.name || order.user?.name || "Customer"} - ₹${order.totalAmount}`,
                        isRead: false,
                    };

                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                    playNotificationSound();
                });
            }

            // 🔄 Detect status changes (for both users and admins)
            orders.forEach((order) => {
                const prevStatus = prevOrdersRef.current[order._id];
                if (prevStatus && prevStatus !== order.status) {
                    const notification = {
                        id: Date.now() + Math.random(),
                        type: "statusUpdate",
                        orderId: order._id,
                        status: order.status,
                        timestamp: new Date(),
                        message: `🔄 Order #${order._id.slice(-4)} → ${order.status}`,
                        isRead: false,
                    };

                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            });

            // update prevOrders map
            prevOrdersRef.current = currentOrdersMap;
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio(
                "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBg=="
            );
            audio.play().catch(() => {
                // Silently fail if audio can't play
            });
        } catch (e) {
            // Notification sound not critical
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const clearNotification = (notificationId) => {
        setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
        );
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                clearNotification,
                clearAllNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
