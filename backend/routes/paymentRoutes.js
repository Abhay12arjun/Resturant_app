// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { 
    getPayments, 
    createUpiPayment, 
    verifyUpiPayment,
    getUpiConfig,
    createRazorpayOrder,
    verifyRazorpayPayment
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// Get all payments (admin)
router.get("/", protect, getPayments);

// Get UPI configuration
router.get("/upi-config", getUpiConfig);

// Create UPI payment
router.post("/upi", protect, createUpiPayment);

// Verify UPI payment
router.get("/verify/:paymentId", protect, verifyUpiPayment);

// ================= RAZORPAY =================
router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

module.exports = router;
