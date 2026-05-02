import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import toast from "react-hot-toast";

const Checkout = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const { cart, getTotalPrice, clearCart } = useCart();

    // 🔐 Check authentication after loading is complete
    useEffect(() => {
        if (!loading && !user) {
            toast.error("Please login to place order 🔐");
            navigate("/login");
        }
    }, [user, loading, navigate]);

    // Show loading screen while verifying token
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

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    // ================= HANDLE INPUT =================
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ================= VALIDATION =================
    const validate = () => {
        const { name, phone, address, city, pincode } = form;

        if (!name || !phone || !address || !city || !pincode) {
            return "All fields are required";
        }

        if (phone.length < 10) {
            return "Invalid phone number";
        }

        return null;
    };

    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);

            const existing = document.getElementById("razorpay-checkout-js");
            if (existing) {
                existing.addEventListener("load", () => resolve(true));
                existing.addEventListener("error", () => resolve(false));
                return;
            }

            const script = document.createElement("script");
            script.id = "razorpay-checkout-js";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    // ================= PROCESS RAZORPAY PAYMENT =================
    const processRazorpayPayment = async (orderId) => {
        try {
            setIsProcessingPayment(true);
            setPaymentStatus("processing");

            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) {
                setPaymentStatus("failed");
                toast.error("Razorpay SDK failed to load");
                setIsProcessingPayment(false);
                return;
            }

            const createRes = await API.post("/payment/razorpay/order", { orderId });
            if (!createRes?.data?.success) {
                throw new Error(createRes?.data?.message || "Failed to start payment");
            }

            const opts = {
                key: createRes.data.keyId,
                amount: createRes.data.amount,
                currency: createRes.data.currency || "INR",
                name: createRes.data.merchantName || "Restaurant App",
                description: `Order ${orderId}`,
                order_id: createRes.data.razorpayOrderId,
                prefill: {
                    name: form.name,
                    email: user?.email || "",
                    contact: form.phone,
                },
                notes: { orderId },
                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true
                },
                // config: {
                //     display: {
                //         blocks: {
                //             upi: {
                //                 name: "Pay via UPI",
                //                 instruments: [{ method: "upi" }],
                //             },
                //         },
                //         sequence: ["block.upi"],
                //         preferences: { show_default_blocks: false },
                //     },
                // },
                modal: {
                    ondismiss: () => {
                        setIsProcessingPayment(false);
                        setPaymentStatus(null);
                    },
                },
                handler: async (response) => {
                    try {
                        const verifyRes = await API.post("/payment/razorpay/verify", {
                            orderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        if (verifyRes?.data?.success) {
                            setPaymentStatus("success");
                            toast.success("Payment successful!");
                            await clearCart();
                            navigate("/orders");
                        } else {
                            setPaymentStatus("failed");
                            toast.error(verifyRes?.data?.message || "Payment verification failed");
                        }
                    } catch (e) {
                        setPaymentStatus("failed");
                        const msg = e?.response?.data?.message || e?.message;
                        toast.error(msg || "Payment verification failed");
                    } finally {
                        setIsProcessingPayment(false);
                    }
                },
                theme: { color: "#22c55e" },
            };

            const rzp = new window.Razorpay(opts);
            rzp.on("payment.failed", (resp) => {
                setPaymentStatus("failed");
                setIsProcessingPayment(false);
                const msg = resp?.error?.description || resp?.error?.reason || "Payment failed";
                toast.error(msg);
            });

            rzp.open();
            return;

            const response = await API.post("/payment/upi", {
                orderId,
                amount: getTotalPrice()
            });

            if (response.data.success) {
                setUpiPayment({
                    paymentId: response.data.paymentId,
                    upiUri: response.data.upiUri,
                    merchantUpiId: response.data.merchantUpiId,
                    merchantName: response.data.merchantName,
                    amount: response.data.amount,
                });

                // Simulate payment verification (in production, use webhooks)
                setTimeout(async () => {
                    try {
                        const verifyRes = await API.get(`/payment/verify/${response.data.paymentId}`);
                        if (verifyRes.data.payment.status === "success") {
                            setPaymentStatus("success");
                            toast.success("Payment successful! 🎉");
                            await clearCart();
                            navigate("/orders");
                        }
                    } catch (err) {
                        setPaymentStatus("failed");
                        toast.error("Payment verification failed");
                    }
                    setIsProcessingPayment(false);
                }, 2500);
            }
        } catch (err) {
            console.log(err);
            setPaymentStatus("failed");
            toast.error("Payment failed");
            setIsProcessingPayment(false);
        }
    };

    // ================= PLACE ORDER =================
    const handlePlaceOrder = async () => {
        const err = validate();
        if (err) return toast.error(err);

        if (cart.length === 0) {
            return toast.error("Cart is empty 🛒");
        }

        try {
            setIsSubmitting(true);

            const items = cart.map((item) => ({
                food: item.food._id,
                name: item.food.name,
                price: item.food.price,
                quantity: item.quantity,
                cutlery: item.cutlery || false,
            }));

            const totalAmount = getTotalPrice();

            const response = await API.post("/orders", {
                customer: form,
                items,
                totalAmount,
                paymentMethod,
            });

            // If online payment, start Razorpay after order creation
            if (paymentMethod === "ONLINE") {
                const orderId = response.data?.order?._id || response.data?._id;
                if (!orderId) {
                    throw new Error("Order ID not returned from server");
                }

                await processRazorpayPayment(orderId);
                return;
            }

            toast.success("Order placed successfully 🎉");

            await clearCart();
            navigate("/orders");

        } catch (err) {
            console.log(err);
            const serverMsg = err?.response?.data?.message;
            if (serverMsg) {
                toast.error(serverMsg);
            } else {
                toast.error("Order failed ❌");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

                {/* ================= LEFT: FORM ================= */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-4">
                        Delivery Details 🚚
                    </h3>

                    <div className="space-y-3">
                        <input name="name" placeholder="Full Name"
                            onChange={handleChange}
                            className="w-full border p-2 rounded" />

                        <input name="phone" placeholder="Phone Number"
                            onChange={handleChange}
                            className="w-full border p-2 rounded" />

                        <textarea name="address" placeholder="Full Address"
                            onChange={handleChange}
                            className="w-full border p-2 rounded" />

                        <input name="city" placeholder="City"
                            onChange={handleChange}
                            className="w-full border p-2 rounded" />

                        <input name="pincode" placeholder="Pincode"
                            onChange={handleChange}
                            className="w-full border p-2 rounded" />
                    </div>

                    {/* PAYMENT */}
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Payment</h4>

                        <label className="block mb-2">
                            <input type="radio"
                                checked={paymentMethod === "COD"}
                                onChange={() => setPaymentMethod("COD")} />
                            <span className="ml-2">Cash On Delivery</span>
                        </label>

                        <label className="block mb-2">
                            <input type="radio"
                                checked={paymentMethod === "ONLINE"}
                                onChange={() => setPaymentMethod("ONLINE")} />
                            <span className="ml-2">Razorpay (UPI / QR)</span>
                        </label>

                        {paymentMethod === "UPI" && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-700">
                                            UPI ID
                                        </p>
                                        <p className="text-sm font-mono text-gray-900 break-all">
                                            {upiPayment?.merchantUpiId || upiConfig?.upiId || "restaurant@upi"}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Amount: â‚¹{getTotalPrice()}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const textToCopy =
                                                    upiPayment?.merchantUpiId ||
                                                    upiConfig?.upiId ||
                                                    "restaurant@upi";
                                                await navigator.clipboard.writeText(textToCopy);
                                                toast.success("UPI ID copied");
                                            } catch (e) {
                                                toast.error("Copy failed");
                                            }
                                        }}
                                        className="shrink-0 px-3 py-1.5 rounded-md bg-white border text-sm hover:bg-gray-50"
                                    >
                                        Copy
                                    </button>
                                </div>

                                {upiPayment?.upiUri && (
                                    <div className="mt-4 flex flex-col items-center">
                                        <div className="bg-white p-3 rounded-md border">
                                            <QRCode value={upiPayment.upiUri} size={180} />
                                        </div>
                                        <a
                                            className="mt-3 text-sm text-blue-700 hover:underline"
                                            href={upiPayment.upiUri}
                                        >
                                            Pay in UPI app
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Status */}
                        {paymentStatus === "processing" && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                                <p className="text-sm text-yellow-700">Processing Payment...</p>
                            </div>
                        )}

                        {paymentStatus === "success" && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg text-center">
                                <p className="text-sm text-green-700">✓ Payment Successful!</p>
                            </div>
                        )}

                        {paymentStatus === "failed" && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg text-center">
                                <p className="text-sm text-red-700">✗ Payment Failed</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= RIGHT: SUMMARY ================= */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-4">
                        Order Summary 🧾
                    </h3>

                    {cart.map((item) => (
                        <div key={item.food._id} className="flex justify-between mb-2">
                            <span>{item.food.name} x {item.quantity}</span>
                            <span>₹{item.food.price * item.quantity}</span>
                        </div>
                    ))}

                    <hr className="my-4" />

                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{getTotalPrice()}</span>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting || isProcessingPayment}
                        className="w-full mt-6 bg-green-500 text-white py-2 rounded-lg disabled:bg-gray-400"
                    >
                        {isSubmitting || isProcessingPayment
                            ? (paymentMethod === "ONLINE" ? "Processing..." : "Placing...")
                            : "Place Order 🚀"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
