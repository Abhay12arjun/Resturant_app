require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const helmet = require("helmet");

const connectDB = require("./config/db");

// 🔗 Connect Database
connectDB();

const app = express();

// ================= CORS CONFIG (FIXED) =================

// ✅ Single source of truth
const CLIENT_URL = process.env.CLIENT_URL || "https://resturant-app-1-6b96.onrender.com";

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ================= MIDDLEWARE =================

// Optional security
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
  })
);

// Logging
app.use(morgan("dev"));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================

app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/food", require("./routes/foodRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/coupon", require("./routes/couponRoutes"));

// ================= HEALTH =================

app.get("/", (req, res) => {
  res.status(200).send("🚀 API Running...");
});

// ================= ERROR HANDLING =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

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
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("joinAdmin", () => {
    socket.join("adminRoom");
  });

  socket.on("joinUser", (userId) => {
    if (userId) socket.join(userId);
  });

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