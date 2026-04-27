import { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";

export default function Notifications() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        clearNotification,
        clearAllNotifications,
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* 🔔 Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative cursor-pointer text-2xl hover:scale-110 transition"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg max-h-96 overflow-auto z-50 border border-gray-200">
                    {/* Header */}
                    <div className="sticky top-0 bg-gray-100 p-3 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">
                            Notifications ({notifications.length})
                        </h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500 text-sm">
                            No notifications yet
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {n.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearNotification(n.id);
                                            }}
                                            className="ml-2 text-gray-400 hover:text-red-600 text-lg"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
