import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // ================= HELPER =================
    const isLoggedIn = () => !!localStorage.getItem("token");

    // ================= FETCH CART =================
    const fetchCart = async () => {
        if (!isLoggedIn()) {
            setCart([]);
            return;
        }

        try {
            setLoading(true);

            const res = await API.get("/cart");

            setCart(res.data?.items || []);
        } catch (err) {
            console.log("Fetch cart error:", err.response?.data);
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    // ================= ADD =================
    const addToCart = async (food, quantity = 1, options = {}) => {
        try {
            // Support callers passing either a food object or a food id
            let foodObj = food;
            const { cutlery = false } = options;

            if (!foodObj) return;

            if (typeof foodObj === "string") {
                // fetch full food object
                const res = await API.get(`/food/${foodObj}`);
                foodObj = res.data;
            }

            // Prevent adding unavailable items (frontend guard)
            if (!foodObj.isAvailable) {
                toast.error(`${foodObj.name || "Item"} is not available ❌`);
                return false;
            }

            if (isLoggedIn()) {
                // If logged in, sync with server and use server cart as source of truth
                const res = await API.post("/cart/add", {
                    foodId: foodObj._id,
                    quantity,
                    cutlery,
                });

                setCart(res.data.items || []);
                toast.success(`${foodObj.name} x${quantity} added 🛒`);
                return true;
            }

            // Guest users: optimistic UI (local only)
            setCart((prev) => {
                const exist = prev.find((item) => item.food._id === foodObj._id && (item.cutlery || false) === cutlery);

                if (exist) {
                    return prev.map((item) =>
                        item.food._id === foodObj._id && (item.cutlery || false) === cutlery
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    return [...prev, { food: foodObj, quantity, cutlery }];
                }
            });

            toast.success(`${foodObj.name} x${quantity} added 🛒`);
            return true;
        } catch (err) {
            console.log("Add to cart error:", err?.response?.data || err.message || err);
            const msg = err?.response?.data?.message || "Failed to add item ❌";
            toast.error(msg);
            return false;
        }
    };

    // ================= REMOVE =================
    const removeFromCart = async (foodId, cutlery) => {
        try {
            const qs = typeof cutlery !== "undefined" ? `?cutlery=${cutlery}` : "";
            const res = await API.delete(`/cart/${foodId}${qs}`);

            setCart(res.data?.items || []);

            toast.success("Item removed ❌");
        } catch (err) {
            console.log(err);
            toast.error("Remove failed");
        }
    };

    // ================= UPDATE QUANTITY =================
    const updateQuantity = async (foodId, type, cutlery) => {
        const item = cart.find((i) => i.food._id === foodId && (typeof cutlery === "undefined" ? true : (i.cutlery || false) === cutlery));
        if (!item) return;

        if (type === "inc") {
            addToCart(item.food, 1, { cutlery: item.cutlery || false }); // ✅ reuse
        } else {
            // 🔻 DECREASE
            if (item.quantity === 1) {
                removeFromCart(foodId, item.cutlery || false);
            } else {
                try {
                    const res = await API.put("/cart/update", {
                        foodId,
                        quantity: item.quantity - 1,
                        cutlery: item.cutlery || false,
                    });

                    setCart(res.data?.items || []);
                } catch (err) {
                    console.log(err);
                    toast.error("Update failed");
                }
            }
        }
    };

    // ================= CLEAR =================
    const clearCart = async () => {
        try {
            await API.delete("/cart/clear");

            setCart([]);
            toast.success("Cart cleared 🧹");
        } catch (err) {
            console.log(err);
            toast.error("Failed to clear cart");
        }
    };

    // ================= TOTAL PRICE =================
    const getTotalPrice = () => {
        return cart.reduce(
            (total, item) =>
                total + item.food.price * item.quantity,
            0
        );
    };

    // ================= TOTAL ITEMS =================
    const getTotalItems = () => {
        return cart.reduce(
            (total, item) => total + item.quantity,
            0
        );
    };

    // ================= LOAD ON START =================
    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                fetchCart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalPrice,
                getTotalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);