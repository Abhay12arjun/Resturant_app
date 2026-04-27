const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ================= CREATE ORDER =================

// ================= GET ORDERS BY USER =================
exports.getOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    let filter = {};

    // 🔥 If userId is passed → filter orders
    if (userId) {
      filter.user = userId;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
};
exports.createOrder = async (req, res) => {
  try {
    const { address, paymentMethod } = req.body;

    // 🔥 Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.food");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    // 🔥 Prepare order items
    const items = cart.items.map((item) => ({
      food: item.food._id,
      name: item.food.name,
      price: item.food.price,
      quantity: item.quantity,
    }));

    // 🔥 Calculate total
    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // 🔥 Create Order
    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      address,
      paymentMethod,
      isPaid: paymentMethod === "COD" ? false : true, // For UPI, payment is processed separately
      paymentStatus: paymentMethod === "UPI" ? "pending" : "pending"
    });

    // 🔥 Clear cart after order
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Order failed" });
  }
};