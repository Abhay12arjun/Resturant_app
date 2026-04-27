const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check Authorization header format
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {
      return res.status(401).json({ msg: "Not authorized, no token" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find user (without password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // ✅ Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error(error.message);

    return res.status(401).json({
      msg: "Not authorized, token failed",
    });
  }
};