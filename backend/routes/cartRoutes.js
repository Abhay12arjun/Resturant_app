const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { protect } = require("../middleware/authMiddleware");

// ================= ADD TO CART =================
router.post("/add", protect, async (req, res) => {
    try {
        const { foodId, quantity = 1, cutlery = false } = req.body;

        // ✅ Validate food exists and is available
        const foodDoc = await Food.findById(foodId);
        if (!foodDoc) {
            return res.status(404).json({ message: "Food not found" });
        }

        if (!foodDoc.isAvailable) {
            return res.status(400).json({ message: "Item is not available" });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [{ food: foodId, quantity, cutlery }],
            });
        } else {
            // treat same food with different cutlery option as distinct item
            const itemIndex = cart.items.findIndex(
                (item) => item.food.toString() === foodId && item.cutlery === !!cutlery
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ food: foodId, quantity, cutlery });
            }
        }

        await cart.save();

        // return populated items for client convenience
        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.food");

        res.json({
            success: true,
            items: updatedCart ? updatedCart.items : [],
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Add to cart failed" });
    }
});


// ================= GET CART =================
router.get("/", protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate("items.food");

        // ✅ if no cart, return empty
        if (!cart) {
            return res.json({ items: [] });
        }

        res.json(cart);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Fetch cart failed" });
    }
});


// ================= REMOVE ITEM =================
router.delete("/:foodId", protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) return res.json({ items: [] });

        const { cutlery } = req.query;

        if (typeof cutlery !== "undefined") {
            const want = cutlery === "true";
            cart.items = cart.items.filter(
                (item) => !(item.food.toString() === req.params.foodId && item.cutlery === want)
            );
        } else {
            cart.items = cart.items.filter(
                (item) => item.food.toString() !== req.params.foodId
            );
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.food");
        res.json({ items: updatedCart ? updatedCart.items : [] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Remove failed" });
    }
});


// ================= UPDATE QUANTITY =================
router.put("/update", protect, async (req, res) => {
    try {
        const { foodId, quantity, cutlery } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(
            (i) => i.food.toString() === foodId && (typeof cutlery === "undefined" ? true : i.cutlery === !!cutlery)
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        item.quantity = quantity;

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.food");
        res.json({ items: updatedCart ? updatedCart.items : [] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Update failed" });
    }
});


// ================= CLEAR CART =================
router.delete("/clear", protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) return res.json({ items: [] });

        cart.items = [];

        await cart.save();

        res.json({ items: [] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Clear failed" });
    }
});


module.exports = router;