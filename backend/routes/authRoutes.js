const express = require("express");
const router = express.Router();

const {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  adminLogin,
  verifyToken,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin); // admin login 👈 NEW
router.post("/google", googleAuth);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// 🔐 VERIFY TOKEN
router.get("/verify", protect, verifyToken);

// Protected route example
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ msg: "Welcome Admin" });
});

module.exports = router;