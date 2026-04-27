const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ================= GET ADMIN PROFILE =================
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized as admin" });
    }

    res.json(admin);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ================= UPDATE ADMIN PROFILE =================
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    let admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized as admin" });
    }

    // Check if email is already in use by another user
    if (email && email !== admin.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: "Email already in use" });
      }
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    await admin.save();

    res.json({
      msg: "Profile updated successfully",
      user: admin
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ msg: "New password must be different from old password" });
    }

    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    await admin.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
