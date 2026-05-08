// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ CUSTOMER DETAILS
    customer: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },

    // ✅ ORDER ITEMS
    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
        },
        cutlery: {
          type: Boolean,
          default: false,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // Timestamps for when the order entered each status
    statusTimestamps: {
      pending: { type: Date, default: Date.now },
      preparing: { type: Date },
      out_for_delivery: { type: Date },
      delivered: { type: Date },
      cancelled: { type: Date },
    },

    // Who cancelled the order (user/admin)
    cancelledBy: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "ONLINE"],
      default: "COD",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    refundStatus: {
      type: String,
      enum: ["not_applicable", "pending", "processed", "failed"],
      default: "not_applicable",
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundId: {
      type: String,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
