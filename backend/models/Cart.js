const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            food: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Food",
            },
            quantity: {
                type: Number,
                default: 1,
            },
            cutlery: {
                type: Boolean,
                default: false,
            },
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);