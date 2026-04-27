// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  getAdminProfile,
  updateAdminProfile,
  changePassword,
} = require("../controllers/adminController");

// Protected admin routes
router.get("/profile", protect, authorize("admin"), getAdminProfile);
router.put("/profile", protect, authorize("admin"), updateAdminProfile);
router.put("/change-password", protect, authorize("admin"), changePassword);

// 👉 Example Admin Controllers (dummy for now)

// Get all users
router.get("/users", (req, res) => {
    res.send("Get all users (Admin)");
});

// Delete a user
router.delete("/users/:id", (req, res) => {
    const userId = req.params.id;
    res.send(`Delete user with ID: ${userId}`);
});

// Get all orders
router.get("/orders", (req, res) => {
    res.send("Get all orders (Admin)");
});

// Update order status
router.put("/orders/:id", (req, res) => {
    const orderId = req.params.id;
    res.send(`Update order status for ID: ${orderId}`);
});

// Get dashboard stats
router.get("/dashboard", (req, res) => {
    res.json({
        totalUsers: 100,
        totalOrders: 250,
        revenue: 50000
    });
});

module.exports = router;