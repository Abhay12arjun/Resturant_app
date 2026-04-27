import Cart from "../models/Cart.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  const { foodId } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user });

    if (!cart) {
      cart = new Cart({
        user: req.user,
        items: [{ food: foodId, quantity: 1 }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.food.toString() === foodId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ food: foodId, quantity: 1 });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user }).populate("items.food");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE ITEM
export const removeFromCart = async (req, res) => {
  const { foodId } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user });

    cart.items = cart.items.filter(
      (item) => item.food.toString() !== foodId
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};