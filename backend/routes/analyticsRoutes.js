// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();

// 📊 Get overall analytics
router.get("/overview", (req, res) => {
    res.json({
        totalUsers: 120,
        totalOrders: 340,
        totalRevenue: 75000
    });
});

// 📈 Orders analytics
router.get("/orders", (req, res) => {
    res.json({
        todayOrders: 25,
        weeklyOrders: 150,
        monthlyOrders: 600
    });
});

// 💰 Revenue analytics
router.get("/revenue", (req, res) => {
    res.json({
        todayRevenue: 5000,
        monthlyRevenue: 120000
    });
});

module.exports = router;