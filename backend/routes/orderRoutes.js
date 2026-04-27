const express = require("express");
const router = express.Router();

const Order = require("../models/Orders");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { protect } = require("../middleware/authMiddleware");

// ================= HELPER =================
const isAdmin = (req) => req.user && req.user.role === "admin";

// =====================================================
// 🟢 CREATE ORDER
// =====================================================
router.post("/", protect, async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentMethod } = req.body;

    // ✅ VALIDATION
    if (
      !customer?.name ||
      !customer?.phone ||
      !customer?.address ||
      !customer?.city ||
      !customer?.pincode ||
      !items ||
      items.length === 0 ||
      !totalAmount
    ) {
      return res.status(400).json({ message: "Missing required fields ❌" });
    }

    // ================= VALIDATE ITEMS & AVAILABILITY =================
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    // Normalize ids and fetch foods
    const foodIds = items.map((it) => {
      return String(it.food?._id ? it.food._id : it.food);
    });

    const foods = await Food.find({ _id: { $in: foodIds } });
    const foodMap = {};
    foods.forEach((f) => (foodMap[f._id.toString()] = f));

    const notFound = foodIds.filter((id) => !foodMap[id]);
    if (notFound.length > 0) {
      return res.status(400).json({ message: "Some items not found" });
    }

    const unavailable = [];
    for (const it of items) {
      const id = String(it.food?._id ? it.food._id : it.food);
      const f = foodMap[id];
      if (!f.isAvailable) unavailable.push(f.name || id);
    }

    if (unavailable.length > 0) {
      return res.status(400).json({ message: `Unavailable items: ${unavailable.join(", ")}` });
    }

    // Recompute total server-side and build sanitized items
    let computedTotal = 0;
    const sanitizedItems = items.map((it) => {
      const id = String(it.food?._id ? it.food._id : it.food);
      const f = foodMap[id];
      const qty = Number(it.quantity) || 1;
      computedTotal += f.price * qty;
      return {
        food: f._id,
        name: f.name,
        price: f.price,
        quantity: qty,
        cutlery: !!it.cutlery,
      };
    });

    // ✅ CREATE ORDER (use server computed total)
    const order = new Order({
      user: req.user._id,
      customer,
      items: sanitizedItems,
      totalAmount: computedTotal,
      paymentMethod,
      isPaid: false,
      paymentStatus: "pending",
    });

    await order.save();

    // ✅ CLEAR CART ITEMS
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );

    res.status(201).json({
      message: "Order placed successfully ✅",
      order,
    });

    // Emit real-time event to admins about new order
    try {
      const io = req.app.get("io");
      if (io) {
        io.to("adminRoom").emit("newOrder", order);
      }
    } catch (e) {
      console.error("Socket emit newOrder failed:", e.message);
    }

  } catch (error) {
    console.log("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// =====================================================
// 🟢 GET MY ORDERS (USER)
// =====================================================
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.food", "name price image")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.log("MY ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// =====================================================
// 🟢 GET ALL ORDERS (ADMIN + FILTER)
// =====================================================
router.get("/", protect, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    const { userId, status } = req.query;

    let filter = {};

    // ✅ FILTER BY USER
    if (userId) {
      filter.user = userId;
    }

    // ✅ FILTER BY STATUS (optional)
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.food", "name price image")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.log("GET ALL ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// =====================================================
// 🟢 GET SINGLE ORDER
// =====================================================
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.food", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    // ✅ OWNER OR ADMIN ONLY
    if (
      order.user.toString() !== req.user._id.toString() &&
      !isAdmin(req)
    ) {
      return res.status(403).json({ message: "Unauthorized ❌" });
    }

    res.json(order);

  } catch (error) {
    console.log("GET SINGLE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// =====================================================
// 🟢 UPDATE ORDER STATUS (ADMIN ONLY)
// =====================================================
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Admin only ❌" });
    }

    const { status } = req.body;

    const validStatuses = [
      "pending",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    // ✅ VALIDATE STATUS
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status ❌" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    // 🚨 BLOCK DELIVERY IF COD NOT PAID
    if (
      status === "delivered" &&
      order.paymentMethod === "COD" &&
      !order.isPaid
    ) {
      return res.status(400).json({
        message: "COD payment not completed ❌",
      });
    }

    // Ensure we have a container for timestamps
    order.statusTimestamps = order.statusTimestamps || {};


    // If status changed, record the time it was set
    if (order.status !== status) {
      order.statusTimestamps[status] = new Date();
      // If cancelling, set cancelledBy
      if (status === "cancelled") {
        order.cancelledBy = req.user.name ? `Admin: ${req.user.name}` : "Admin";
      }
    }

    order.status = status;
    await order.save();

    // Emit real-time update to the order owner (and admins if desired)
    try {
      const io = req.app.get("io");
      if (io) {
        // notify the user
        io.to(String(order.user)).emit("orderUpdated", order);
        // also notify admins that status changed
        io.to("adminRoom").emit("orderStatusChanged", order);
      }
    } catch (e) {
      console.error("Socket emit orderUpdated failed:", e.message);
    }

    res.json({
      message: "Order status updated ✅",
      order,
    });

  } catch (error) {
    console.log("STATUS UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// =====================================================
// 🟢 UPDATE PAYMENT STATUS
// =====================================================
router.put("/:id/payment", protect, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Admin only ❌" });
    }

    const { isPaid } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    order.isPaid = isPaid;
    await order.save();

    res.json({
      message: "Payment status updated 💰",
      order,
    });

  } catch (error) {
    console.log("PAYMENT UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// =====================================================
// 🟢 DELETE ORDER (USER OR ADMIN)
// =====================================================
router.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    // ✅ OWNER OR ADMIN
    if (
      order.user.toString() !== req.user._id.toString() &&
      !isAdmin(req)
    ) {
      return res.status(403).json({ message: "Unauthorized ❌" });
    }


    // Instead of deleting, mark as cancelled and save timestamp
    order.statusTimestamps = order.statusTimestamps || {};

    order.status = "cancelled";
    order.statusTimestamps.cancelled = new Date();
    // Set who cancelled: admin or user
    if (isAdmin(req)) {
      order.cancelledBy = req.user.name ? `Admin: ${req.user.name}` : "Admin";
    } else {
      order.cancelledBy = req.user.name ? `User: ${req.user.name}` : "User";
    }
    await order.save();

    // Notify admins that the order was cancelled
    try {
      const io = req.app.get("io");
      if (io) {
        io.to("adminRoom").emit("orderStatusChanged", order);
      }
    } catch (e) {
      console.error("Socket emit orderCancelled failed:", e.message);
    }

    res.json({ message: "Order cancelled", order });

  } catch (error) {
    console.log("DELETE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
