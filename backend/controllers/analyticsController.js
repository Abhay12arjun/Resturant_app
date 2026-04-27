const Order = require("../models/Order");

exports.getAnalytics = async (req, res) => {
  const orders = await Order.find();

  const revenueByDay = {};

  orders.forEach(order => {
    const date = order.createdAt.toISOString().split("T")[0];
    revenueByDay[date] = (revenueByDay[date] || 0) + order.totalAmount;
  });

  res.json({ revenueByDay });
};