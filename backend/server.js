require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const helmet = require("helmet");
// 📂 Category Routes


const connectDB = require("./config/db");

// 🔗 Connect Database
connectDB();

const app = express();

// ================= MIDDLEWARE =================

// ✅ Security headers
// Disable Cross-Origin-Opener-Policy to avoid blocking cross-window postMessage
// (some OAuth flows and dev HMR clients rely on cross-window messaging)

app.use(cors({
  origin: "https://resturant-app-1-6b96.onrender.com",
  credentials: true
}));
// app.use(
//   helmet({
//     crossOriginOpenerPolicy: false,
//   })
// );

// ✅ Logging
app.use(morgan("dev"));
// 📂 Category Routes
app.use("/api/category", require("./routes/categoryRoutes"));
// ✅ CORS (FIXED for auth)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// ✅ Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================

// 🔐 Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// 🍔 Food Routes
app.use("/api/food", require("./routes/foodRoutes"));

// 🛒 Cart Routes
app.use("/api/cart", require("./routes/cartRoutes"));

// 📦 Order Routes
app.use("/api/orders", require("./routes/orderRoutes"));

// 💳 Payment Routes
app.use("/api/payment", require("./routes/paymentRoutes"));

// 🧑‍🍳 Admin Routes
app.use("/api/admin", require("./routes/adminRoutes"));

// 📊 Analytics Routes
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// 🎟️ Coupon Routes
app.use("/api/coupon", require("./routes/couponRoutes"));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).send("🚀 API Running...");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= SOCKET.IO =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 🔥 Attach io globally
app.set("io", io);

// 🔔 Socket Events
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // 👨‍🍳 Admin joins room
  socket.on("joinAdmin", () => {
    socket.join("adminRoom");
    console.log("👨‍🍳 Admin joined adminRoom");
  });

  // 👤 User joins personal room
  socket.on("joinUser", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  // 🔔 Order status update (important for your system)
  socket.on("orderUpdate", ({ userId, order }) => {
    io.to(userId).emit("orderUpdated", order);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});