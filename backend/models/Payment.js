// backend/models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: Number,
    payerUpiId: {
      type: String,
      default: null,
    },
    merchantUpiId: {
      type: String,
      default: null,
    },
    upiUri: {
      type: String,
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: "INR",
    },
    method: {
      type: String,
      enum: ["card", "upi", "cod", "razorpay"],
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
