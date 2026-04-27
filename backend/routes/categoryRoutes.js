const express = require("express");
const router = express.Router();

// 📌 GET all categories
router.get("/", (req, res) => {
  res.json({
    success: true,
    categories: ["Pizza", "Burger", "Drinks"], // replace with DB later
  });
});

// 📌 ADD category (optional)
router.post("/", (req, res) => {
  const { name } = req.body;

  res.json({
    success: true,
    message: `Category ${name} added`,
  });
});

module.exports = router;