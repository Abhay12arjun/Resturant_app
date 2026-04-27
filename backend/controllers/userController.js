const User = require("../models/User");
const Order = require("../models/Order");

exports.getUsers = async (req, res) => {
  const users = await User.find({ role: "customer" });

  const data = await Promise.all(
    users.map(async (u) => {
      const orders = await Order.find({ userId: u._id });
      const totalSpent = orders.reduce((a, b) => a + b.totalAmount, 0);

      return {
        ...u._doc,
        totalOrders: orders.length,
        totalSpent
      };
    })
  );

  res.json(data);
};