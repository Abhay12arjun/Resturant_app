const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
// ================= DB CONNECT =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// ================= USER MODEL =================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

// ================= CREATE ADMIN =================
const createAdmin = async () => {
  const admin = await User.findOne({ email: "admin@gmail.com" });

  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin Created ✅");
  }
};

createAdmin();

// ================= ROUTES =================

// Test route
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});