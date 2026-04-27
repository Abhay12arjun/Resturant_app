// backend/models/Food.js
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["veg", "non-veg", "drinks", "desserts", "pizza", "burger"],
    },

    image: {
      type: String, // URL or file path
      default: "",
    },
    cloudinary_id: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false, // for homepage highlight
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);