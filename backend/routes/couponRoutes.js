// routes/couponRoutes.js
const express = require("express");
const router = express.Router();

// 🎟️ Get all coupons
router.get("/", (req, res) => {
    res.json([
        { code: "SAVE10", discount: 10 },
        { code: "WELCOME20", discount: 20 }
    ]);
});

// ➕ Create a coupon
router.post("/", (req, res) => {
    const { code, discount } = req.body;
    res.json({
        message: "Coupon created",
        coupon: { code, discount }
    });
});

// ❌ Delete a coupon
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    res.send(`Deleted coupon with ID: ${id}`);
});

module.exports = router;