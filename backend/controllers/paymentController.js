const Payment = require("../models/Payment");
const Order = require("../models/Orders");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const isAdmin = (req) => req.user && req.user.role === "admin";

const buildUpiUri = ({ payeeVpa, payeeName, amount, transactionNote, transactionRef }) => {
  const params = new URLSearchParams();
  params.set("pa", String(payeeVpa || ""));
  params.set("pn", String(payeeName || ""));
  params.set("am", String(amount || ""));
  params.set("cu", "INR");
  if (transactionNote) params.set("tn", String(transactionNote));
  if (transactionRef) params.set("tr", String(transactionRef));
  return `upi://pay?${params.toString()}`;
};

let razorpayClient = null;
const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  return razorpayClient;
};

// ================= GET ALL PAYMENTS =================
exports.getPayments = async (req, res) => {
  const { status, startDate, endDate } = req.query;

  let filter = {};

  if (status) filter.status = status;
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const payments = await Payment.find(filter)
    .populate("order")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(payments);
};

// ================= CREATE UPI PAYMENT =================
exports.createUpiPayment = async (req, res) => {
  try {
    const { orderId, upiId, amount } = req.body;
    const payerUpiId = upiId || null;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Ensure only order owner (or admin) can create a payment for this order
    if (!isAdmin(req) && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // If a payer UPI ID is provided (for collect flows), validate basic format
    if (payerUpiId && !payerUpiId.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid UPI ID format",
      });
    }

    const merchantUpiId = process.env.MERCHANT_UPI_ID || "restaurant@upi";
    const merchantName = process.env.MERCHANT_NAME || "Restaurant App";
    const finalAmount = Number(amount || order.totalAmount || 0);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      amount: finalAmount,
      payerUpiId,
      merchantUpiId,
      method: "upi",
      status: "pending"
    });

    const upiUri = buildUpiUri({
      payeeVpa: merchantUpiId,
      payeeName: merchantName,
      amount: payment.amount,
      transactionNote: `Order ${String(order._id)}`,
      transactionRef: String(payment._id),
    });

    payment.upiUri = upiUri;
    await payment.save();

    // Simulate UPI payment processing (in production, integrate with actual UPI gateway)
    // For demo purposes, we'll mark as success after a short delay
    setTimeout(async () => {
      try {
        await Payment.findByIdAndUpdate(payment._id, { status: "success" });
        await Order.findByIdAndUpdate(order._id, {
          isPaid: true,
          paymentStatus: "paid",
        });
      } catch (e) {
        console.error("UPI payment simulation update failed:", e.message);
      }
    }, 2000);

    res.status(201).json({
      success: true,
      message: "UPI payment initiated",
      paymentId: payment._id,
      payerUpiId,
      merchantUpiId,
      merchantName,
      upiUri,
      amount: payment.amount,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false, 
      message: "Payment failed" 
    });
  }
};

// ================= VERIFY UPI PAYMENT =================
exports.verifyUpiPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("order");

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    // Ensure only payment owner (or admin) can read payment status
    if (!isAdmin(req) && String(payment.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false, 
      message: "Verification failed" 
    });
  }
};

// ================= GET UPI CONFIG =================
exports.getUpiConfig = async (req, res) => {
  // Return merchant UPI ID (configure this in your environment variables)
  const merchantUpiId = process.env.MERCHANT_UPI_ID || "restaurant@upi";
  
  res.json({
    success: true,
    upiId: merchantUpiId,
    merchantName: process.env.MERCHANT_NAME || "Restaurant App"
  });
};

// ================= CREATE RAZORPAY ORDER =================
exports.createRazorpayOrder = async (req, res) => {
  try {
    const client = getRazorpayClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!isAdmin(req) && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    if (order.paymentMethod !== "ONLINE") {
      return res.status(400).json({ success: false, message: "Order is not marked for online payment" });
    }

    const amountPaise = Math.round(Number(order.totalAmount || 0) * 100);
    if (!amountPaise || amountPaise <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order amount" });
    }

    const rpOrder = await client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: String(order._id),
      notes: {
        orderId: String(order._id),
        userId: String(req.user._id),
      },
    });

    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: Number(order.totalAmount || 0),
      currency: rpOrder.currency || "INR",
      method: "razorpay",
      status: "pending",
      razorpayOrderId: rpOrder.id,
    });

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      merchantName: process.env.MERCHANT_NAME || "Restaurant App",
      orderId: String(order._id),
      paymentId: String(payment._id),
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
    });
  } catch (err) {
    console.error("CREATE RAZORPAY ORDER ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
};

// ================= VERIFY RAZORPAY PAYMENT =================
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!isAdmin(req) && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, message: "Razorpay is not configured" });
    }

    const existingPayment = await Payment.findOne({
      order: order._id,
      method: "razorpay",
      razorpayOrderId,
    });

    if (!existingPayment) {
      return res.status(400).json({ success: false, message: "Unknown Razorpay order for this order" });
    }

    const expected = crypto
      .createHmac("sha256", String(keySecret))
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expected !== razorpaySignature) {
      existingPayment.status = "failed";
      existingPayment.razorpayPaymentId = razorpayPaymentId;
      await existingPayment.save();

      await Order.findByIdAndUpdate(order._id, { isPaid: false, paymentStatus: "failed" });

      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    existingPayment.status = "success";
    existingPayment.razorpayPaymentId = razorpayPaymentId;
    existingPayment.currency = "INR";
    await existingPayment.save();

    await Order.findByIdAndUpdate(order._id, { isPaid: true, paymentStatus: "paid" });

    res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    console.error("VERIFY RAZORPAY PAYMENT ERROR:", err);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};
