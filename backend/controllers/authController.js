const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../config/mail");

const withTimeout = (promise, timeoutMs, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), timeoutMs)
    ),
  ]);

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};



//Admin Login

// ================= ADMIN LOGIN =================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    // 🔒 Check admin role
    if (user.role !== "admin")
      return res.status(403).json({ msg: "Not authorized as admin" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      token: generateToken(user._id),
      user: userData,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= GOOGLE AUTH =================
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        profileImage,
      });
    }

    res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: "Google auth failed" });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const user = await withTimeout(
      User.findOne({ email: req.body.email }).maxTimeMS(10000),
      15000,
      "Database timeout while finding reset user"
    );

    if (!user) {
      return res.json({ msg: "If that email exists, a reset link will be sent shortly." });
    }

    // 🔐 Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // ⏱️ Use ENV instead of hardcode
    const expireMinutes = parseInt(process.env.RESET_PASSWORD_EXPIRE) || 15;
    user.resetPasswordExpire =
      Date.now() + expireMinutes * 60 * 1000;

    await withTimeout(
      user.save(),
      15000,
      "Database timeout while saving reset token"
    );

    // 🌐 Dynamic client URL
    const clientUrl = (process.env.CLIENT_URL || "https://resturant-app-1-w8cs.onrender.com")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <h3>Password Reset Request</h3>
      <p>Click below to reset password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    res.json({ msg: "If that email exists, a reset link will be sent shortly." });

    // Send email after responding so SMTP latency cannot cause a browser timeout.
    withTimeout(
      sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      }),
      30000,
      "Email service timeout while sending reset link"
    ).catch((error) => {
      console.error("Password reset email failed:", error.message);
    });

  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(err.message.includes("timeout") ? 504 : 500).json({
      msg: err.message.includes("timeout")
        ? "Password reset service timed out. Please try again shortly."
        : "Email sending failed",
    });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await withTimeout(
      User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).maxTimeMS(10000),
      15000,
      "Database timeout while validating reset token"
    );

    if (!user) {
      console.log("❌ Reset token invalid or expired:", req.params.token);
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await withTimeout(
      user.save(),
      15000,
      "Database timeout while saving new password"
    );

    console.log("✅ Password reset successful for user:", user.email);
    res.json({ msg: "Password reset successful" });

  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(err.message.includes("timeout") ? 504 : 500).json({
      msg: err.message.includes("timeout")
        ? "Password reset service timed out. Please try again shortly."
        : "Reset failed",
    });
  }
};

// ================= VERIFY TOKEN =================
exports.verifyToken = async (req, res) => {
  try {
    // req.user is set by authMiddleware.protect
    const userData = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };

    res.json({
      valid: true,
      user: userData,
    });
  } catch (err) {
    res.status(401).json({
      valid: false,
      msg: "Token verification failed",
    });
  }
};
